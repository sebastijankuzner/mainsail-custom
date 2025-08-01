export type TrueExpression = {
	op: "true";
};

export type FalseExpression = {
	op: "false";
};

export type EqualExpression<TEntity> = {
	property: keyof TEntity;
	jsonFieldAccessor?: JsonFieldAccessor;
	op: "equal";
	value: any;
};

export type NotEqualExpression<TEntity> = {
	property: keyof TEntity;
	jsonFieldAccessor?: JsonFieldAccessor;
	op: "notEqual";
	value: any;
};

export type BetweenExpression<TEntity> = {
	property: keyof TEntity;
	jsonFieldAccessor?: JsonFieldAccessor;
	op: "between";
	from: any;
	to: any;
};

export type GreaterThanEqualExpression<TEntity> = {
	property: keyof TEntity;
	jsonFieldAccessor?: JsonFieldAccessor;
	op: "greaterThanEqual";
	value: any;
};

export type LessThanEqualExpression<TEntity> = {
	property: keyof TEntity;
	jsonFieldAccessor?: JsonFieldAccessor;
	op: "lessThanEqual";
	value: any;
};

export type LikeExpression<TEntity> = {
	property: keyof TEntity;
	jsonFieldAccessor?: JsonFieldAccessor;
	op: "like";
	pattern: any;
};

export type ContainsExpression<TEntity> = {
	property: keyof TEntity;
	jsonFieldAccessor?: JsonFieldAccessor;
	op: "contains";
	value: any;
};

export type AndExpression<TEntity> = {
	op: "and";
	expressions: Expression<TEntity>[];
};

export type OrExpression<TEntity> = {
	op: "or";
	expressions: Expression<TEntity>[];
};

export type JsonbAttributeExists<TEntity> = {
	property: keyof TEntity;
	op: "jsonbAttributeExists";
	attribute: string;
};

export type FunctionSigExpression<TEntity> = {
	property: keyof TEntity;
	op: "functionSig";
	value: string;
};

export type Expression<TEntity> =
	| TrueExpression
	| FalseExpression
	| EqualExpression<TEntity>
	| NotEqualExpression<TEntity>
	| BetweenExpression<TEntity>
	| GreaterThanEqualExpression<TEntity>
	| LessThanEqualExpression<TEntity>
	| LikeExpression<TEntity>
	| ContainsExpression<TEntity>
	| AndExpression<TEntity>
	| OrExpression<TEntity>
	| JsonbAttributeExists<TEntity>
	| FunctionSigExpression<TEntity>;

export type JsonFieldOperator = "->>";
export type JsonFieldCastType = "bigint" | "numeric";
export type JsonFieldAccessor = {
	operator: JsonFieldOperator;
	fieldName: string;
	cast?: JsonFieldCastType;
};
