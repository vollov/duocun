import { Request, Response } from "express";
import { ObjectID } from "mongodb";
import { DB } from "./db";
import { Entity } from "./entity";

export class Restaurant extends Entity{
  constructor(dbo: DB) {
		super(dbo, 'restaurants');
  }

  get(req: Request, res: Response){
    const self = this;
    const id = req.params.id;
    
    this.findOne({_id: new ObjectID(id)}).then((r: any) => {
      if(r){
        res.send(JSON.stringify(r, null, 3));
      }else{
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }
}