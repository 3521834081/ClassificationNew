import { SensitiveLevel } from '../../graphql.schema';

export class createSensitiveLevelDto implements SensitiveLevel {
  name: string;
  color: string;
  count: number;
  describe: string;
  classification_template_id: number;
  create_time: Date;
  update_time: Date;
}
