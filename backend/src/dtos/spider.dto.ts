import { IsString } from "class-validator";

export class MonKnow {
  @IsString()
  public cateId: string;

  @IsString()
  public secret: string;

  @IsString()
  public firstLevelId: string;

  @IsString()
  public secondLevelId: string;
}

export class XiaoDai {
  @IsString()
  public firstLevelId: string;

  @IsString()
  public type: string;
}
