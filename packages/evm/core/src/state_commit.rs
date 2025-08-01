use std::collections::{BTreeMap, HashMap};

use alloy_sol_types::SolEvent;
use revm::{
    context::result::ExecutionResult,
    database::WrapDatabaseRef,
    primitives::{Address, B256},
};

use crate::{
    db::{CommitData, CommitKey, Error, GenesisInfo, PendingCommit, PersistentDB},
    state_changes::{self, AccountMergeInfo, AccountUpdate},
};

#[derive(Clone, Debug, Default)]
pub struct StateCommit {
    pub key: CommitKey,
    pub change_set: state_changes::StateChangeset,
    pub results: BTreeMap<B256, ExecutionResult>,
}

pub fn build_commit(pending_commit: &mut PendingCommit) -> Result<StateCommit, crate::db::Error> {
    assert!(pending_commit.built_commit.is_none());
    let mut state_builder = revm::database::State::builder()
        .with_cached_prestate(std::mem::take(&mut pending_commit.cache))
        .build();

    state_builder.transition_state = Some(std::mem::take(&mut pending_commit.transitions));
    state_builder
        .merge_transitions(revm::database::states::bundle_state::BundleRetention::PlainState);

    let bundle = state_builder.take_bundle();
    let mut change_set = state_changes::bundle_into_change_set(bundle);

    change_set.legacy_attributes = std::mem::take(&mut pending_commit.legacy_attributes);
    change_set.legacy_cold_wallets = std::mem::take(&mut pending_commit.legacy_cold_wallets);
    change_set.merged_legacy_cold_wallets =
        std::mem::take(&mut pending_commit.merged_legacy_cold_wallets)
            .into_iter()
            .filter_map(|(key, legacy)| legacy.map(|v| (key, v)))
            .collect();

    Ok(StateCommit {
        key: pending_commit.key,
        change_set,
        results: std::mem::take(&mut pending_commit.results),
    })
}

pub fn apply_rewards(
    db: &mut PersistentDB,
    pending: &mut PendingCommit,
    rewards: HashMap<Address, u128>,
) -> Result<(), crate::db::Error> {
    let mut state = revm::database::State::builder()
        .with_bundle_update()
        .with_cached_prestate(std::mem::take(&mut pending.cache))
        .with_database(WrapDatabaseRef(&db))
        .build();

    state.increment_balances(rewards)?;

    if let Some(transition_state) = state.transition_state.take() {
        // println!("transition state {:#?}", transition_state);
        pending
            .transitions
            .add_transitions(transition_state.transitions.into_iter().collect());
    }

    pending.cache = std::mem::take(&mut state.cache);
    // println!("cache {:#?}", pending.cache.accounts);

    Ok(())
}

pub fn commit_to_db(
    db: &mut PersistentDB,
    mut pending_commit: PendingCommit,
    commit_data: Option<CommitData>,
) -> Result<Vec<AccountUpdate>, crate::db::Error> {
    let genesis_info = db.genesis_info.clone();
    let mut commit = match pending_commit.built_commit {
        Some(commit) => commit,
        None => build_commit(&mut pending_commit)?,
    };

    match db.commit(&mut commit, &commit_data) {
        Ok(_) => Ok(collect_dirty_accounts(commit, &genesis_info)),
        Err(err) => match &err {
            Error::DbFull => {
                // try to resize the db and attempt another commit on success
                db.resize().and_then(|_| {
                    db.commit(&mut commit, &commit_data)
                        .and_then(|_| Ok(collect_dirty_accounts(commit, &genesis_info)))
                })
            }
            _ => Err(err),
        },
    }
}

fn collect_dirty_accounts(
    commit: StateCommit,
    genesis_info: &Option<GenesisInfo>,
) -> Vec<AccountUpdate> {
    let mut dirty_accounts = HashMap::with_capacity(commit.change_set.accounts.len());

    for (address, account) in commit.change_set.accounts {
        if let Some(account) = account {
            dirty_accounts.insert(
                address,
                AccountUpdate {
                    address,
                    balance: account.balance,
                    nonce: account.nonce,
                    vote: None,
                    unvote: None,
                    username: None,
                    username_resigned: false,
                    merge_info: commit
                        .change_set
                        .merged_legacy_cold_wallets
                        .get(&address)
                        .map(|value| AccountMergeInfo {
                            legacy_address: value.1,
                            transaction_hash: value.0,
                        }),
                },
            );
        }
    }

    if let Some(info) = genesis_info {
        for receipt in commit.results.values() {
            match receipt {
                ExecutionResult::Success { logs, .. } => {
                    for log in logs {
                        match log.address {
                            _ if log.address == info.validator_contract => {
                                // Attempt to decode the log as a Voted event
                                if let Ok(event) = crate::events::Voted::decode_log(&log) {
                                    // println!(
                                    //     "Voted event (from={:?} to={:?})",
                                    //     event.data.voter, event.data.validator,
                                    // );

                                    dirty_accounts.get_mut(&event.voter).and_then(|account| {
                                        account.vote = Some(event.validator);
                                        account.unvote = None; // cancel out any previous unvote if one happened in same commit
                                        Some(account)
                                    });

                                    break;
                                }

                                // Attempt to decode the log as a Unvoted event
                                if let Ok(event) = crate::events::Unvoted::decode_log(&log) {
                                    // println!(
                                    //     "Unvoted event (from={:?} removed vote={:?})",
                                    //     event.data.voter, event.data.validator,
                                    // );

                                    dirty_accounts.get_mut(&event.voter).and_then(|account| {
                                        account.unvote = Some(event.validator);
                                        account.vote = None; // cancel out any previous vote if one happened in same commit
                                        Some(account)
                                    });

                                    break;
                                }
                            }
                            _ if log.address == info.username_contract => {
                                // Attempt to decode log as a UsernameRegistered event
                                if let Ok(event) =
                                    crate::events::UsernameRegistered::decode_log(&log)
                                {
                                    dirty_accounts.get_mut(&event.addr).and_then(|account| {
                                        account.username = Some(event.username.clone());
                                        account.username_resigned = false; // cancel out any previous resignation if one happened in same commit
                                        Some(account)
                                    });
                                    break;
                                }

                                // Attempt to decode log as a UsernameResigned event
                                if let Ok(event) = crate::events::UsernameResigned::decode_log(&log)
                                {
                                    dirty_accounts.get_mut(&event.addr).and_then(|account| {
                                        account.username = None; // cancel out any previous registration if one happened in same commit
                                        account.username_resigned = true;
                                        Some(account)
                                    });
                                    break;
                                }
                            }
                            _ => (), // ignore
                        }
                    }

                    //
                }
                ExecutionResult::Revert { .. } | ExecutionResult::Halt { .. } => (), // ignore
            }
        }
    }

    dirty_accounts.into_values().collect()
}

#[test]
fn test_apply_rewards() {
    let path = tempfile::Builder::new()
        .prefix("evm.mdb")
        .tempdir()
        .unwrap();

    let mut db = PersistentDB::new(crate::db::PersistentDBOptions::new(
        path.path().to_path_buf(),
    ))
    .expect("database");
    let mut pending = PendingCommit::default();

    let account1 = revm::primitives::address!("bd6f65c58a46427af4b257cbe231d0ed69ed5508");
    let account2 = revm::primitives::address!("ad6f65c58a46427af4b257cbe231d0ed69ed5508");

    let mut rewards = HashMap::<Address, u128>::new();
    rewards.insert(account1, 1234);
    rewards.insert(account2, 0);

    let result = self::apply_rewards(&mut db, &mut pending, rewards);
    assert!(result.is_ok());

    assert!(pending.cache.accounts.contains_key(&account1));
    assert!(!pending.cache.accounts.contains_key(&account2));

    assert!(pending.transitions.transitions.contains_key(&account1));
    assert!(!pending.transitions.transitions.contains_key(&account2));
}
