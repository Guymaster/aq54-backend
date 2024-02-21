import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { DbService } from './db.service';
import { Request, Response } from '@nestjs/common';
import { CustomException } from './common/exceptions';
import { AggregationTypes, RefExceptions, StatusCodes } from './common/values';
import { GetLastMeasurementsAggregationParams, GetMeasurementsAggregationParams, GetMeasurementsAggregationQuery, GetUniqueSensorParams } from './common/validation';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly dbService: DbService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("/sensors")
  async getAllSensors(): Promise<SensorResponseDto[]> {
    const db = this.dbService.getDb();
    const sensors = await db.sensor.findMany({
        orderBy: {
            id: "asc"
        }
    });
    return sensors;
  }

  @Get("/sensors/:sensor_id")
  async getSensorById(@Param() params: GetUniqueSensorParams): Promise<SensorResponseDto>{
    const db = this.dbService.getDb();
    const sensor = await db.sensor.findUnique({
        where: {
            id: params.sensor_id
        }
    });
    if(!sensor){
        throw new CustomException(RefExceptions.RESOURCE_NOT_FOUND, StatusCodes.RESOURCE_NOT_FOUND, "This sensor doesn't exist");
    }
    return sensor;
  }

  @Get("/sensors/:sensor_id/measurements")
  async getSensorMesurementsByAggregation(@Param() params: GetMeasurementsAggregationParams, @Query() query: GetMeasurementsAggregationQuery): Promise<MeasurementsAggregationResponseDto>{
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
    const filteredMeasurements = measurements.filter((obj, index, array) => {
        if (index === 0 || lastDate == null){
          lastDate = obj.created_at;
          return true;
        }
        const currentDate = new Date(obj.created_at);
        const timeDifference = (currentDate.getTime() - lastDate.getTime()) / (1000 * 60);
        const isAllowed = timeDifference >= query.interval;
        if(isAllowed){
          lastDate = obj.created_at;
        }
        return isAllowed;
    });
    return filteredMeasurements;
  }

  @Get("/sensors/:sensor_id/measurements/last")
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
        throw new CustomException(RefExceptions.RESOURCE_NOT_FOUND, StatusCodes.RESOURCE_NOT_FOUND, "This is no measurement yet");
    }
    const baseDate = lastMeasurement.created_at;
    let startDate = new Date(baseDate.toISOString());
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    let endDate = new Date(baseDate.toISOString());
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    startDate.setHours(0);
    endDate.setHours(23);
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
    const filteredMeasurements = measurements.filter((obj, index, array) => {
        if (index === 0){
            return true;
        }
        const prevDate = new Date(array[index - 1].created_at);
        const currentDate = new Date(obj.created_at);
        const timeDifference = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60);
        return timeDifference >= 5;
    });
    return {
      interval: interval,
      results: filteredMeasurements,
      base_date: baseDate,
      aggr_type: AggregationTypes.DAILY
    };
  }
}

type MeasurementsAggregationResponseDto = {
  id: number,
  sensor_id: string,
  latitude: number,
  longitude: number,
  co: number,
  co2: number,
  no2: number,
  o3: number,
  pm10: number,
  pm25: number,
  rh: number,
  extT: number,
  intT: number,
  voc: number,
  created_at: Date,
  updated_at: Date
}[];

type SensorResponseDto = {
  id: string,
  latitude: number,
  longitude: number,
  created_at: Date,
  updated_at: Date
};

type LastMeasurementAggregationResponseDto = {
  interval: number,
  results: MeasurementsAggregationResponseDto,
  base_date: Date,
  aggr_type: AggregationTypes
};