import { IsDateString, IsDivisibleBy, IsEnum, IsInt, IsNotEmpty, IsNumber, IsNumberString, IsPositive, IsString, Matches, Max, Min, ValidationError, ValidatorOptions } from "class-validator";
import { AggregationTypes } from "./values";

export interface ValidationPipeOptions extends ValidatorOptions {
    transform?: boolean;
    disableErrorMessages?: boolean;
    exceptionFactory?: (errors: ValidationError[]) => any;
}

export class GetUniqueSensorParams {
  @IsNotEmpty() @IsString() sensor_id: string;
}

export class GetMeasurementsAggregationParams {
  @IsNotEmpty() @IsString() sensor_id: string;
}

export class GetMeasurementsAggregationQuery {
  @IsNotEmpty() @IsString() @Matches(/^[0-9]{4}-((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01])|(0[469]|11)-(0[1-9]|[12][0-9]|30)|(02)-(0[1-9]|[12][0-9]))T(0[0-9]|1[0-9]|2[0-3]):(0[0-9]|[1-5][0-9]):(0[0-9]|[1-5][0-9])\.[0-9]{3}Z$/gm) @IsDateString()
    base_date: string;
  @IsNotEmpty() @IsString() @IsEnum(AggregationTypes) aggr_type: AggregationTypes;
  @IsNumberString() @Matches(/^(?:[5-9]|[1-5][0-9]|240)$/gm) interval: number
}

export class GetLastMeasurementsAggregationParams {
  @IsNotEmpty() @IsString() sensor_id: string;
}