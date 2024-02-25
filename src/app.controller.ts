import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { DbService } from './db.service';
import { Request, Response, UseGuards } from '@nestjs/common';
import { CustomException } from './common/exceptions';
import { AggregationTypes, RefExceptions, StatusCodes } from './common/values';
import { GetLastMeasurementsAggregationParams, GetMeasurementsAggregationParams, GetMeasurementsAggregationQuery, GetUniqueSensorParams } from './common/validation';
import { ApiBearerAuth, ApiExtraModels, ApiProperty, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';

class MeasurementResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() sensor_id: string;
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
  @ApiProperty() co: number;
  @ApiProperty() co2: number;
  @ApiProperty() no2: number;
  @ApiProperty() o3: number;
  @ApiProperty() pm10: number;
  @ApiProperty() pm25: number;
  @ApiProperty() rh: number;
  @ApiProperty() extT: number;
  @ApiProperty() intT: number;
  @ApiProperty() voc: number;
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date
}[];

class LastMeasurementAggregationResponseDto {
  @ApiProperty() interval: number;
  @ApiProperty() results: MeasurementResponseDto[];
  @ApiProperty() base_date: Date;
  @ApiProperty() aggr_type: AggregationTypes
};

class SensorResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date
};

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly dbService: DbService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiExtraModels(SensorResponseDto)
  @Get("/sensors")
  @ApiResponse({ 
    status: StatusCodes.OK, 
    description: 'OK', 
    schema: {
      type: "array",
      items: {
        $ref: getSchemaPath(SensorResponseDto)
      }
    }
  })
  @ApiResponse({ status: StatusCodes.INTERNAL_SERVER_ERROR, description: 'Internal server error'})
  @ApiResponse({ status: StatusCodes.BAD_REQUEST, description: 'Bad request'})
  @ApiResponse({ status: StatusCodes.RESOURCE_NOT_FOUND, description: 'Resource not found'})
  async getAllSensors(): Promise<SensorResponseDto[]> {
    const db = this.dbService.getDb();
    const sensors = await db.sensor.findMany({
        orderBy: {
            id: "asc"
        }
    });
    await db.$disconnect();
    return sensors;
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiExtraModels(SensorResponseDto)
  @Get("/sensors/:sensor_id")
  @ApiResponse({ 
    status: StatusCodes.OK, 
    description: 'OK', 
    schema: {
      $ref: getSchemaPath(SensorResponseDto)
    }
  })
  @ApiResponse({ status: StatusCodes.OK, description: 'OK'})
  @ApiResponse({ status: StatusCodes.INTERNAL_SERVER_ERROR, description: 'Internal server error'})
  @ApiResponse({ status: StatusCodes.BAD_REQUEST, description: 'Bad request'})
  @ApiResponse({ status: StatusCodes.RESOURCE_NOT_FOUND, description: 'Resource not found'})
  async getSensorById(@Param() params: GetUniqueSensorParams): Promise<SensorResponseDto>{
    const db = this.dbService.getDb();
    const sensor = await db.sensor.findUnique({
        where: {
            id: params.sensor_id
        }
    });
    if(!sensor){
      await db.$disconnect();
        throw new CustomException(RefExceptions.RESOURCE_NOT_FOUND, StatusCodes.RESOURCE_NOT_FOUND, "This sensor doesn't exist");
    }
    await db.$disconnect();
    return sensor;
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiExtraModels(MeasurementResponseDto)
  @Get("/sensors/:sensor_id/measurements")
  @ApiResponse({ 
    status: StatusCodes.OK, 
    description: 'OK', 
    schema: {
      type: "array",
      items: {
        $ref: getSchemaPath(MeasurementResponseDto)
      }
    }
  })
  @ApiResponse({ status: StatusCodes.OK, description: 'OK'})
  @ApiResponse({ status: StatusCodes.INTERNAL_SERVER_ERROR, description: 'Internal server error'})
  @ApiResponse({ status: StatusCodes.BAD_REQUEST, description: 'Bad request'})
  @ApiResponse({ status: StatusCodes.RESOURCE_NOT_FOUND, description: 'Resource not found'})
  async getSensorMesurementsByAggregation(@Param() params: GetMeasurementsAggregationParams, @Query() query: GetMeasurementsAggregationQuery): Promise<MeasurementResponseDto[]>{
    const db = this.dbService.getDb();
    const baseDate = new Date(query.base_date.toString());
    const aggrType = query.aggr_type;
    let startDate = new Date(baseDate.toISOString());
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    let endDate = new Date(baseDate.toISOString());
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    if(aggrType == AggregationTypes.DAILY){
        startDate.setHours(0);
        endDate.setHours(23);
    }
    let measurements = await db.measurement.findMany({
        where: {
            sensor_id: params.sensor_id,
            created_at: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: {
            created_at: "asc"
        }
    });
    let lastDate: Date | null = null;
    let filteredMeasurements = [];
    measurements.filter(async (obj, index, array) => {
        if (index === 0 || lastDate == null){
          lastDate = obj.created_at;
          await db.$disconnect();
          return true;
        }
        const currentDate = new Date(obj.created_at);
        const timeDifference = (currentDate.getTime() - lastDate.getTime()) / (1000 * 60);
        const isAllowed = timeDifference >= query.interval;
        console.log(timeDifference, isAllowed)
        if(isAllowed){
          lastDate = obj.created_at;
          filteredMeasurements.push(obj);
        }
        await db.$disconnect();
        return isAllowed;
    });
    await db.$disconnect();
    return filteredMeasurements;
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiExtraModels(LastMeasurementAggregationResponseDto)
  @ApiExtraModels(MeasurementResponseDto)
  @Get("/sensors/:sensor_id/measurements/last")
  @ApiResponse({ 
    status: StatusCodes.OK, 
    description: 'OK', 
    schema: {
      type: "object",
      properties: {
        interval: {
          type: "integer"
        },
        results: {
          $ref: getSchemaPath(MeasurementResponseDto)
        },
        base_date: {
          type: "string",
          format: "date-time",
          example: "2017-07-21T17:32:28Z"
        },
        aggr_type: {
          type: "enum",
          enum: ["HOURLY", "DAILY"]
        }
      }
    }
  })
  @ApiResponse({ status: StatusCodes.OK, description: 'OK'})
  @ApiResponse({ status: StatusCodes.INTERNAL_SERVER_ERROR, description: 'Internal server error'})
  @ApiResponse({ status: StatusCodes.BAD_REQUEST, description: 'Bad request'})
  @ApiResponse({ status: StatusCodes.RESOURCE_NOT_FOUND, description: 'Resource not found'})
  async getLastSensorMesurementsDailyAggregation(@Param() params: GetLastMeasurementsAggregationParams): Promise<LastMeasurementAggregationResponseDto>{
    const interval = 60;
    const db = this.dbService.getDb();
    let lastMeasurement = await db.measurement.findFirst({
        where: {
            sensor_id: params.sensor_id,
        },
        orderBy: {
            created_at: "desc"
        }
    });
    if(!lastMeasurement){
        await db.$disconnect();
        throw new CustomException(RefExceptions.RESOURCE_NOT_FOUND, StatusCodes.RESOURCE_NOT_FOUND, "This is no measurement yet");
    }
    const baseDate = lastMeasurement.created_at;
    let startDate = new Date(baseDate.toISOString());
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    let endDate = new Date(baseDate.toISOString());
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    endDate.setHours(23);
    endDate.setMilliseconds(59);
    let measurements = await db.measurement.findMany({
        where: {
            sensor_id: params.sensor_id,
            created_at: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: {
            created_at: "asc"
        }
    });
    let lastDate: Date | null = null;
    let filteredMeasurements = [];
    measurements.filter(async (obj, index, array) => {
        if (index === 0 || lastDate == null){
          lastDate = obj.created_at;
          await db.$disconnect();
          return true;
        }
        const currentDate = new Date(obj.created_at);
        const timeDifference = (currentDate.getTime() - lastDate.getTime()) / (1000 * 60);
        const isAllowed = timeDifference >= interval;
        console.log(timeDifference, isAllowed)
        if(isAllowed){
          lastDate = obj.created_at;
          filteredMeasurements.push(obj);
        }
        return isAllowed;
    });
    await db.$disconnect();
    return {
      interval: interval,
      results: filteredMeasurements,
      base_date: baseDate,
      aggr_type: AggregationTypes.DAILY
    };
  }
}