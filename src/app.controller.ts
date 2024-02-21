import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { DbService } from './db.service';
import { Request, Response } from '@nestjs/common';
import { CustomException } from './common/exceptions';
import { AggregationTypes, RefExceptions, StatusCodes } from './common/values';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly dbService: DbService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("/sensors")
  async getAllSensors(): Promise<object[]> {
    const db = this.dbService.getDb();
    const sensors = await db.sensor.findMany({
        orderBy: {
            id: "asc"
        }
    });
    return sensors;
  }

  @Get("/sensors/:sensor_id")
  async getSensorById(@Param('sensor_id') sensor_id: string): Promise<object>{
    const db = this.dbService.getDb();
    const sensor = await db.sensor.findUnique({
        where: {
            id: sensor_id
        }
    });
    if(!sensor){
        throw new CustomException(RefExceptions.RESOURCE_NOT_FOUND, StatusCodes.RESOURCE_NOT_FOUND, "This sensor doesn't exist");
    }
    return sensor;
  }

  @Get("/sensors/:sensor_id/measurements")
  async getSensorMesurementsByAggregation(@Param('sensor_id') sensor_id: string, @Query('base_date') base_date: string, @Query('base_date') aggr_type: "HOURLY" | "DAILY"): Promise<object[]>{
    const db = this.dbService.getDb();
    const baseDate = new Date(base_date.toString());
    const aggrType = aggr_type;
    let startDate = baseDate;
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    let endDate = baseDate;
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    if(aggrType == AggregationTypes.DAILY){
        startDate.setHours(0);
        endDate.setHours(23);
    }
    let measurements = await db.measurement.findMany({
        where: {
            sensor_id: sensor_id.toString(),
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
    return filteredMeasurements;
  }

  @Get("/sensors/:sensor_id/measurements/last")
  async getLastSensorMesurementsDailyAggregation(@Param('sensor_id') sensor_id: string): Promise<object[]>{
    const db = this.dbService.getDb();
    let lastMeasurement = await db.measurement.findFirst({
        where: {
            sensor_id: sensor_id,
        },
        orderBy: {
            created_at: "desc"
        }
    });
    if(!lastMeasurement){
        throw new CustomException(RefExceptions.RESOURCE_NOT_FOUND, StatusCodes.RESOURCE_NOT_FOUND, "This is no measurement yet");
    }
    const baseDate = lastMeasurement.created_at;
    let startDate = baseDate;
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    let endDate = baseDate;
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    startDate.setHours(0);
    endDate.setHours(23);
    let measurements = await db.measurement.findMany({
        where: {
            sensor_id: sensor_id,
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
    return filteredMeasurements;
}
}
