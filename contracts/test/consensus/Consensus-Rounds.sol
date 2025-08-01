// SPDX-License-Identifier: GNU GENERAL PUBLIC LICENSE
pragma solidity ^0.8.13;

import {ConsensusV1} from "@contracts/consensus/ConsensusV1.sol";
import {Base} from "./Base.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract ConsensusTest is Base {
    function test_revert_if_caller_is_not_owner() public {
        vm.startPrank(address(1));

        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, address(1)));
        consensus.getRounds(0, 10);
    }

    function test_should_return_empty() public view {
        assertEq(consensus.getRoundsCount(), 0);
        assertEq(consensus.getRounds(0, 10).length, 0);
    }

    function test_should_return_round_with_one_validator() public {
        address addr = address(1);
        vm.startPrank(addr);
        consensus.registerValidator(prepareBLSKey(addr));
        vm.stopPrank();

        consensus.calculateRoundValidators(1);

        assertEq(consensus.getRoundsCount(), 1);
        ConsensusV1.Round[] memory rounds = consensus.getRounds(0, 10);
        assertEq(rounds.length, 1);
        assertEq(rounds[0].round, 1);
        assertEq(rounds[0].validators.length, 1);
        assertEq(rounds[0].validators[0].addr, addr);
    }

    function test_should_keep_historic_vote_balance() public {
        address addr = address(1);
        vm.startPrank(addr);
        consensus.registerValidator(prepareBLSKey(addr));
        vm.stopPrank();

        // ConsensusV1.Round 1
        consensus.calculateRoundValidators(1);
        assertEq(consensus.getRoundsCount(), 1);
        ConsensusV1.Round[] memory rounds = consensus.getRounds(0, 10);
        assertEq(rounds.length, 1);
        assertEq(rounds[0].round, 1);
        assertEq(rounds[0].validators.length, 1);
        assertEq(rounds[0].validators[0].addr, addr);
        assertEq(rounds[0].validators[0].voteBalance, 0 ether);

        // Vote
        address voterAddr1 = address(2);
        vm.deal(voterAddr1, 100 ether);
        vm.startPrank(voterAddr1);
        consensus.vote(addr);
        vm.stopPrank();

        // ConsensusV1.Round 2
        consensus.calculateRoundValidators(1);
        assertEq(consensus.getRoundsCount(), 2);
        rounds = consensus.getRounds(0, 10);
        assertEq(rounds.length, 2);
        assertEq(rounds[0].round, 1);
        assertEq(rounds[0].validators.length, 1);
        assertEq(rounds[0].validators[0].addr, addr);
        assertEq(rounds[0].validators[0].voteBalance, 0 ether);
        assertEq(rounds[1].round, 2);
        assertEq(rounds[1].validators.length, 1);
        assertEq(rounds[1].validators[0].addr, addr);
        assertEq(rounds[1].validators[0].voteBalance, 100 ether);

        // Vote
        address voterAddr2 = address(3);
        vm.deal(voterAddr2, 100 ether);
        vm.startPrank(voterAddr2);
        consensus.vote(addr);
        vm.stopPrank();

        // ConsensusV1.Round 3
        consensus.calculateRoundValidators(1);
        assertEq(consensus.getRoundsCount(), 3);
        rounds = consensus.getRounds(0, 10);
        assertEq(rounds.length, 3);
        assertEq(rounds[0].round, 1);
        assertEq(rounds[0].validators.length, 1);
        assertEq(rounds[0].validators[0].addr, addr);
        assertEq(rounds[0].validators[0].voteBalance, 0 ether);
        assertEq(rounds[1].round, 2);
        assertEq(rounds[1].validators.length, 1);
        assertEq(rounds[1].validators[0].addr, addr);
        assertEq(rounds[1].validators[0].voteBalance, 100 ether);
        assertEq(rounds[2].round, 3);
        assertEq(rounds[2].validators.length, 1);
        assertEq(rounds[2].validators[0].addr, addr);
        assertEq(rounds[2].validators[0].voteBalance, 200 ether);
    }

    function test_slice_should_work() public {
        address addr = address(1);
        vm.startPrank(addr);
        consensus.registerValidator(prepareBLSKey(addr));
        vm.stopPrank();

        // Create 3 rounds
        consensus.calculateRoundValidators(1);
        consensus.calculateRoundValidators(1);
        consensus.calculateRoundValidators(1);

        // Assert rounds count
        assertEq(consensus.getRoundsCount(), 3);

        // Shoudl slice array if count is greater than rounds left
        ConsensusV1.Round[] memory rounds = consensus.getRounds(0, 10);
        assertEq(rounds.length, 3);
        assertEq(rounds[0].round, 1);
        assertEq(rounds[1].round, 2);
        assertEq(rounds[2].round, 3);

        // Shoudl work with count 0
        rounds = consensus.getRounds(0, 0);
        assertEq(rounds.length, 0);

        // Shoudl work with count 1
        rounds = consensus.getRounds(0, 1);
        assertEq(rounds.length, 1);
        assertEq(rounds[0].round, 1);

        // Shoudl respect offset
        rounds = consensus.getRounds(1, 1);
        assertEq(rounds.length, 1);
        assertEq(rounds[0].round, 2);

        rounds = consensus.getRounds(2, 1);
        assertEq(rounds.length, 1);
        assertEq(rounds[0].round, 3);

        // Should return empty if out of range
        rounds = consensus.getRounds(3, 1);
        assertEq(rounds.length, 0);

        rounds = consensus.getRounds(100, 100);
        assertEq(rounds.length, 0);
    }
}
