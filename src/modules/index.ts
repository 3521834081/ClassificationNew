import { ClassificationTemplateModule } from './classificationTemplate/module';
import { RecognitionModelModule } from './recognitionModel/module';
import { SensitiveRuleModule } from './sensitiveRules/module';
import { SensitiveClassificationModule } from './sensitiveClassification/module';
import { DataAssetAuthorizationModule } from './dataAssetAuthorization/module';
import { SensitiveResultModule } from './sensitiveResult/module';
import { DbSensitiveResultModule } from './dbSensitiveResult/module';
import { RecognizeMonitorModule } from './recognizeMonitor/module';

/** 框架需要加载的模块，在此处注册后会自动导入 */
const modules = [
  ClassificationTemplateModule,
  RecognitionModelModule,
  SensitiveRuleModule,
  SensitiveClassificationModule,
  DataAssetAuthorizationModule,
  SensitiveResultModule,
  DbSensitiveResultModule,
  RecognizeMonitorModule,
];

export default modules;
