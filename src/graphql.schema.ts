
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface CreateClassificationTemplateInput {
    type: number;
    isUse: number;
    name: string;
    describe: string;
}

export interface UpdateClassificationTemplateInput {
    isUse?: Nullable<number>;
    name?: Nullable<string>;
    describe?: Nullable<string>;
}

export interface CreateSqlInfoInputs {
    resources_info_id?: Nullable<number>;
    db_type?: Nullable<string>;
    database?: Nullable<string>;
    port?: Nullable<number>;
    user?: Nullable<string>;
    password?: Nullable<string>;
    describe?: Nullable<string>;
}

export interface UpdateSqlInfoInputs {
    id: number;
    identify_permissions?: Nullable<number>;
    show_count?: Nullable<number>;
    user?: Nullable<string>;
    password?: Nullable<string>;
    describe?: Nullable<string>;
}

export interface CreateRecognitionModelInput {
    name: string;
    type: number;
    rule: JSON;
    describe?: Nullable<string>;
}

export interface UpdateRecognitionModelInput {
    name?: Nullable<string>;
    type?: Nullable<number>;
    rule?: Nullable<JSON>;
    describe?: Nullable<string>;
}

export interface CreateSensitiveClassificationInput {
    title: string;
    parentKey: number;
}

export interface UpdateSensitiveClassificationInput {
    categoryLevel?: Nullable<number>;
    parentKey?: Nullable<string>;
    title?: Nullable<string>;
    key?: Nullable<string>;
    children?: Nullable<JSON>;
}

export interface CreateSensitiveRuleInput {
    uuid?: Nullable<string>;
    name?: Nullable<string>;
    sensitiveLevelId?: Nullable<number>;
    recognitionModelId?: Nullable<number>;
    classificationTemplateId?: Nullable<number>;
    sensitiveClassificationId?: Nullable<number>;
    status?: Nullable<number>;
    scanRange?: Nullable<JSON>;
    recognitionModelIds?: Nullable<Nullable<number>[]>;
    attributeType?: Nullable<string>;
    describe?: Nullable<string>;
}

export interface CreateSensitiveRuleInputs {
    sensitiveRules: Nullable<CreateSensitiveRuleInput>[];
}

export interface CreateSensitiveLevelInput {
    name?: Nullable<string>;
    color?: Nullable<string>;
    describe?: Nullable<string>;
    classification_template_id?: Nullable<number>;
    type?: Nullable<number>;
}

export interface CreateResourceInfoInput {
    instance?: Nullable<string>;
    instanceAlias?: Nullable<string>;
    region?: Nullable<string>;
    province?: Nullable<string>;
    authorizedDatabase?: Nullable<number>;
    describe?: Nullable<string>;
}

export interface UpdateResourceInfoInput {
    instance?: Nullable<string>;
    instanceAlias?: Nullable<string>;
    region?: Nullable<string>;
    province?: Nullable<string>;
    authorizedDatabase?: Nullable<number>;
    describe?: Nullable<string>;
}

export interface DeleteResourceInfosInput {
    id?: Nullable<number>;
    instance?: Nullable<string>;
    instanceAlias?: Nullable<string>;
    region?: Nullable<string>;
    province?: Nullable<string>;
    authorizedDatabase?: Nullable<number>;
    describe?: Nullable<string>;
}

export interface ClassificationTemplate {
    id?: Nullable<number>;
    type?: Nullable<number>;
    is_use?: Nullable<number>;
    name?: Nullable<string>;
    describe?: Nullable<string>;
    create_time?: Nullable<Date>;
    update_time?: Nullable<Date>;
    is_delete?: Nullable<boolean>;
}

export interface SensitiveRuleWithLevel {
    id?: Nullable<number>;
    uuid?: Nullable<string>;
    name?: Nullable<string>;
    sensitiveLevelId?: Nullable<number>;
    recognitionModelId?: Nullable<number>;
    classificationTemplateId?: Nullable<number>;
    sensitiveClassificationId?: Nullable<number>;
    modelInfo?: Nullable<RecognitionModel>;
    status?: Nullable<number>;
    scanRange?: Nullable<JSON>;
    createTime?: Nullable<Date>;
    updateTime?: Nullable<Date>;
    isDelete?: Nullable<boolean>;
    attributeType?: Nullable<string>;
    describe?: Nullable<string>;
    sensitiveLevel?: Nullable<SensitiveLevel>;
}

export interface ClassificationTemplatesResult {
    data?: Nullable<Nullable<ClassificationTemplate>[]>;
    total?: Nullable<number>;
}

export interface DeleteClassificationTemplateResult {
    isSuccess?: Nullable<boolean>;
}

export interface CopyClassificationTemplateResult {
    isSuccess?: Nullable<boolean>;
}

export interface ClassificationAndRulesResult {
    classifications?: Nullable<Nullable<SensitiveClassification>[]>;
    rules?: Nullable<Nullable<SensitiveRuleWithLevel>[]>;
}

export interface IQuery {
    classificationTemplate(id?: Nullable<number>): Nullable<ClassificationTemplate> | Promise<Nullable<ClassificationTemplate>>;
    allClassificationTemplates(skip?: Nullable<number>, take?: Nullable<number>): Nullable<ClassificationTemplatesResult> | Promise<Nullable<ClassificationTemplatesResult>>;
    classificationTemplates(id?: Nullable<number>, type?: Nullable<number>, name?: Nullable<string>, describe?: Nullable<string>, isUse?: Nullable<number>, skip?: Nullable<number>, take?: Nullable<number>): Nullable<ClassificationTemplatesResult> | Promise<Nullable<ClassificationTemplatesResult>>;
    findClassificationByIds(templateId: number, classificationId: number): Nullable<ClassificationAndRulesResult> | Promise<Nullable<ClassificationAndRulesResult>>;
    findIsUseClassification(): Nullable<ClassificationTemplate> | Promise<Nullable<ClassificationTemplate>>;
    sqlInfos(id?: Nullable<number>, resources_info_id?: Nullable<number>, identify_permissions?: Nullable<number>, db_type?: Nullable<string>, region?: Nullable<string>, skip?: Nullable<number>, take?: Nullable<number>): Nullable<SqlInfoResult> | Promise<Nullable<SqlInfoResult>>;
    getMysqlIsTure(resources_info_id?: Nullable<number>, port?: Nullable<number>, user?: Nullable<string>, database?: Nullable<string>, password?: Nullable<string>): Nullable<IsMysqlTureResult> | Promise<Nullable<IsMysqlTureResult>>;
    getAuthorizedDb(resources_info_id?: Nullable<number>): Nullable<SqlInfoResult> | Promise<Nullable<SqlInfoResult>>;
    sqlInfosNoDb(id?: Nullable<number>, resources_info_id?: Nullable<number>, identify_permissions?: Nullable<number>, db_type?: Nullable<string>, skip?: Nullable<number>, take?: Nullable<number>): Nullable<SqlInfoNoDbResult> | Promise<Nullable<SqlInfoNoDbResult>>;
    dbSensitiveResult(region?: Nullable<string>, instance?: Nullable<string>, db_type?: Nullable<string>, self_db_id?: Nullable<number>, starttime?: Nullable<Date>, endtime?: Nullable<Date>, skip?: Nullable<number>, take?: Nullable<number>): Nullable<DbSensitiveResultModel> | Promise<Nullable<DbSensitiveResultModel>>;
    tablesDetail(database_id?: Nullable<number>, table_name?: Nullable<string>, hit_rule?: Nullable<string>, sensitive_level?: Nullable<string>, skip?: Nullable<number>, take?: Nullable<number>): Nullable<TableResultModel> | Promise<Nullable<TableResultModel>>;
    columnDetail(database_id?: Nullable<number>, table_name?: Nullable<string>, skip?: Nullable<number>, take?: Nullable<number>): Nullable<ColumnDetailResult> | Promise<Nullable<ColumnDetailResult>>;
    recognitionModel(id?: Nullable<number>): Nullable<RecognitionModel> | Promise<Nullable<RecognitionModel>>;
    recognitionModels(id?: Nullable<number>, name?: Nullable<string>, type?: Nullable<number>, rule?: Nullable<JSON>, describe?: Nullable<string>, skip?: Nullable<number>, take?: Nullable<number>): Nullable<RecognitionModelResult> | Promise<Nullable<RecognitionModelResult>>;
    sqlInfosAndScanState(id?: Nullable<number>, instance?: Nullable<string>, region?: Nullable<string>, startTime?: Nullable<Date>, endTime?: Nullable<Date>, resources_info_id?: Nullable<number>, identify_permissions?: Nullable<number>, db_type?: Nullable<string>, skip?: Nullable<number>, take?: Nullable<number>): Nullable<SqlInfoResult> | Promise<Nullable<SqlInfoResult>>;
    getScanState(ids: number[]): Nullable<ScanStatusResult> | Promise<Nullable<ScanStatusResult>>;
    scanById(id?: Nullable<number>): Nullable<number> | Promise<Nullable<number>>;
    sensitiveClassification(): Nullable<SensitiveClassificationResultNoTotal> | Promise<Nullable<SensitiveClassificationResultNoTotal>>;
    getRulePath(ruleId: number): Nullable<RulePathResult> | Promise<Nullable<RulePathResult>>;
    sensitiveResult(tableName?: Nullable<string>, region?: Nullable<string>, instance?: Nullable<string>, hitData?: Nullable<JSON>, starttime?: Nullable<Date>, endtime?: Nullable<Date>, skip?: Nullable<number>, take?: Nullable<number>): Nullable<SensitiveResultModel> | Promise<Nullable<SensitiveResultModel>>;
    columnInfo(sensitive_result_id?: Nullable<number>, skip?: Nullable<number>, take?: Nullable<number>): Nullable<ColumnInfoResult> | Promise<Nullable<ColumnInfoResult>>;
    revisedRecord(resource?: Nullable<number>, database?: Nullable<string>, hit_rule?: Nullable<string>, sensitive_level?: Nullable<string>, skip?: Nullable<number>, take?: Nullable<number>): Nullable<RevisedRecordResult> | Promise<Nullable<RevisedRecordResult>>;
    sensitiveRule(id?: Nullable<number>): Nullable<SensitiveRule> | Promise<Nullable<SensitiveRule>>;
    modelAndRules(sensitive_rules_id?: Nullable<number>): Nullable<ModelAndRules> | Promise<Nullable<ModelAndRules>>;
    sensitiveRules(id?: Nullable<number>, uuid?: Nullable<string>, name?: Nullable<string>, sensitiveLevelId?: Nullable<number>, recognitionModelId?: Nullable<number>, classificationTemplateId?: Nullable<number>, sensitiveClassificationId?: Nullable<number>, sensitiveClassificationIds?: Nullable<Nullable<number>[]>, status?: Nullable<number>, scanRange?: Nullable<JSON>, skip?: Nullable<number>, take?: Nullable<number>): Nullable<SensitiveRuleResult> | Promise<Nullable<SensitiveRuleResult>>;
    sensitiveLevel(id?: Nullable<number>): Nullable<SensitiveLevel> | Promise<Nullable<SensitiveLevel>>;
    allSensitiveLevel(): Nullable<Nullable<SensitiveLevel>[]> | Promise<Nullable<Nullable<SensitiveLevel>[]>>;
    allSensitiveLevelOnUse(skip?: Nullable<number>, take?: Nullable<number>): Nullable<SensitiveLevelResult> | Promise<Nullable<SensitiveLevelResult>>;
    resourceInfo(id?: Nullable<number>): Nullable<ResourceInfo> | Promise<Nullable<ResourceInfo>>;
    resourceInfos(id?: Nullable<number>, instance?: Nullable<string>, instanceAlias?: Nullable<string>, region?: Nullable<string>, province?: Nullable<string>, authorizedDatabase?: Nullable<number>, describe?: Nullable<string>, skip?: Nullable<number>, take?: Nullable<number>): Nullable<ResourceInfoResult> | Promise<Nullable<ResourceInfoResult>>;
}

export interface IMutation {
    createClassificationTemplate(createClassificationTemplateInput?: Nullable<CreateClassificationTemplateInput>): Nullable<ClassificationTemplate> | Promise<Nullable<ClassificationTemplate>>;
    deleteClassificationTemplate(id?: Nullable<number>): Nullable<DeleteClassificationTemplateResult> | Promise<Nullable<DeleteClassificationTemplateResult>>;
    updateClassificationTemplate(id?: Nullable<number>, updateClassificationTemplateInput?: Nullable<UpdateClassificationTemplateInput>): Nullable<ClassificationTemplate> | Promise<Nullable<ClassificationTemplate>>;
    copyClassificationTemplate(templateId?: Nullable<number>): Nullable<CopyClassificationTemplateResult> | Promise<Nullable<CopyClassificationTemplateResult>>;
    createSqlInfos(createSqlInfoInputs: CreateSqlInfoInputs[]): Nullable<CreateManySqlCount> | Promise<Nullable<CreateManySqlCount>>;
    updateSqlInfos(updateSqlInfoInputs: UpdateSqlInfoInputs[]): Nullable<UpdataManySqlCount> | Promise<Nullable<UpdataManySqlCount>>;
    deleteSqlInfo(id: number): Nullable<SqlInfo> | Promise<Nullable<SqlInfo>>;
    updateHitRules(database_id?: Nullable<number>, table_name?: Nullable<string>, column_id?: Nullable<number>, hit_rule?: Nullable<string>): Nullable<Column> | Promise<Nullable<Column>>;
    createRecognitionModel(createRecognitionModelInput?: Nullable<CreateRecognitionModelInput>): Nullable<RecognitionModel> | Promise<Nullable<RecognitionModel>>;
    deleteRecognitionModel(id?: Nullable<number>): Nullable<RecognitionModel> | Promise<Nullable<RecognitionModel>>;
    updateRecognitionModel(id?: Nullable<number>, updateRecognitionModelInput?: Nullable<UpdateRecognitionModelInput>): Nullable<RecognitionModel> | Promise<Nullable<RecognitionModel>>;
    createSensitiveClassification(title: string, parentKey: number): Nullable<SensitiveClassification> | Promise<Nullable<SensitiveClassification>>;
    createSensitiveClassifications(CreateSensitiveClassificationInputs: CreateSensitiveClassificationInput[]): Nullable<CreatManyPayload> | Promise<Nullable<CreatManyPayload>>;
    deleteSensitiveClassification(key: number): Nullable<DeleteSensitiveClassificationResult> | Promise<Nullable<DeleteSensitiveClassificationResult>>;
    updateSensitiveClassification(key?: Nullable<number>, title?: Nullable<string>): Nullable<SensitiveClassification> | Promise<Nullable<SensitiveClassification>>;
    RevisionHitRules(sensitive_result_id?: Nullable<number>, column_id?: Nullable<number>, hit_rule?: Nullable<string>, sensitive_level?: Nullable<string>): Nullable<ColumnInfo> | Promise<Nullable<ColumnInfo>>;
    RecoveryHitRules(id?: Nullable<number>): Nullable<ColumnInfo> | Promise<Nullable<ColumnInfo>>;
    createSensitiveRule(createSensitiveRuleInput?: Nullable<CreateSensitiveRuleInput>): Nullable<SensitiveRule> | Promise<Nullable<SensitiveRule>>;
    createSensitiveRules(createSensitiveRuleInputs?: Nullable<CreateSensitiveRuleInputs>): Nullable<CreatManyPayload> | Promise<Nullable<CreatManyPayload>>;
    deleteSensitiveRule(id?: Nullable<number>): Nullable<DeleteSensitiveRuleResult> | Promise<Nullable<DeleteSensitiveRuleResult>>;
    updateSensitiveRule(id?: Nullable<number>, createSensitiveRuleInput?: Nullable<CreateSensitiveRuleInput>): Nullable<SensitiveRule> | Promise<Nullable<SensitiveRule>>;
    createSensitiveLevel(createSensitiveLevelInput?: Nullable<CreateSensitiveLevelInput>): Nullable<SensitiveLevel> | Promise<Nullable<SensitiveLevel>>;
    deleteSensitiveLevel(id?: Nullable<number>): Nullable<SensitiveLevel> | Promise<Nullable<SensitiveLevel>>;
    updateSensitiveLevel(id?: Nullable<number>, describe?: Nullable<string>): Nullable<SensitiveLevel> | Promise<Nullable<SensitiveLevel>>;
    createResourceInfo(createResourceInfoInput?: Nullable<CreateResourceInfoInput>): Nullable<ResourceInfo> | Promise<Nullable<ResourceInfo>>;
    deleteResourceInfo(id?: Nullable<number>): Nullable<ResourceInfo> | Promise<Nullable<ResourceInfo>>;
    updateResourceInfo(id?: Nullable<number>, updateResourceInfoInput?: Nullable<UpdateResourceInfoInput>): Nullable<ResourceInfo> | Promise<Nullable<ResourceInfo>>;
    deleteResourceInfos(deleteResourceInfosInput?: Nullable<Nullable<DeleteResourceInfosInput>[]>): Nullable<DeleteCount> | Promise<Nullable<DeleteCount>>;
    deleteResources(id?: Nullable<Nullable<number>[]>): Nullable<DeleteCount> | Promise<Nullable<DeleteCount>>;
}

export interface SqlInfo {
    id?: Nullable<number>;
    resources_info_id?: Nullable<number>;
    show_count?: Nullable<number>;
    identify_permissions?: Nullable<number>;
    db_type?: Nullable<string>;
    port?: Nullable<number>;
    user?: Nullable<string>;
    database?: Nullable<string>;
    password?: Nullable<string>;
    describe?: Nullable<string>;
    create_time?: Nullable<string>;
    update_time?: Nullable<string>;
    scan_time?: Nullable<Date>;
    resourceInfo: ResourceInfo;
    mysqlIsTure?: Nullable<boolean>;
}

export interface SqlInfoNoDb {
    id?: Nullable<number>;
    resources_info_id?: Nullable<number>;
    show_count?: Nullable<number>;
    identify_permissions?: Nullable<number>;
    db_type?: Nullable<string>;
    port?: Nullable<number>;
    user?: Nullable<string>;
    database?: Nullable<string>;
    password?: Nullable<string>;
    describe?: Nullable<string>;
    create_time?: Nullable<string>;
    update_time?: Nullable<string>;
    scan_time?: Nullable<Date>;
    resourceInfo: ResourceInfo;
}

export interface SqlInfoResult {
    data?: Nullable<Nullable<SqlInfo>[]>;
    total?: Nullable<number>;
}

export interface SqlInfoNoDbResult {
    data?: Nullable<Nullable<SqlInfoNoDb>[]>;
    total?: Nullable<number>;
}

export interface IsMysqlTureResult {
    success?: Nullable<boolean>;
    code?: Nullable<number>;
    message?: Nullable<string>;
    data?: Nullable<JSON>;
}

export interface CreateManySqlCount {
    count: number;
}

export interface UpdataManySqlCount {
    count: number;
}

export interface DbSensitiveResult {
    id?: Nullable<number>;
    self_db_id?: Nullable<number>;
    total_tables?: Nullable<number>;
    sensitive_tables?: Nullable<number>;
    create_time?: Nullable<Date>;
    update_time?: Nullable<Date>;
    sqlInfoResult?: Nullable<SqlInfoResult>;
}

export interface Column {
    id?: Nullable<number>;
    column_name?: Nullable<string>;
    hit_rule?: Nullable<string>;
    sensitive_level?: Nullable<string>;
    revision_status?: Nullable<number>;
    sampling_results?: Nullable<string>;
    before_hit_rule?: Nullable<string>;
}

export interface DbSensitiveResultModel {
    data?: Nullable<Nullable<DbSensitiveResult>[]>;
    total?: Nullable<number>;
}

export interface ColumnDetailResult {
    data?: Nullable<Nullable<Column>[]>;
    total?: Nullable<number>;
}

export interface TableResultModel {
    data?: Nullable<Nullable<SensitiveResult>[]>;
    arr?: Nullable<Nullable<number>[]>;
    total?: Nullable<number>;
}

export interface RecognitionModel {
    id?: Nullable<number>;
    name?: Nullable<string>;
    type?: Nullable<number>;
    rule?: Nullable<JSON>;
    describe?: Nullable<string>;
    create_time?: Nullable<Date>;
    update_time?: Nullable<Date>;
    is_delete?: Nullable<boolean>;
}

export interface RecognitionModelResult {
    data?: Nullable<Nullable<RecognitionModel>[]>;
    total?: Nullable<number>;
}

export interface ScanStatusResult {
    data?: Nullable<Nullable<ScanParameters>[]>;
}

export interface ScanParameters {
    id?: Nullable<number>;
    scanStateCode?: Nullable<number>;
    sacnStateMessage?: Nullable<string>;
}

export interface SensitiveClassification {
    key?: Nullable<number>;
    parentKey?: Nullable<number>;
    sort?: Nullable<number>;
    depth?: Nullable<number>;
    title?: Nullable<string>;
    classification_template_id?: Nullable<number>;
}

export interface SensitiveClassificationResult {
    data?: Nullable<Nullable<SensitiveClassification>[]>;
    total?: Nullable<number>;
}

export interface SensitiveClassificationResultNoTotal {
    data?: Nullable<Nullable<SensitiveClassification>[]>;
}

export interface DeleteSensitiveClassificationResult {
    deleteSuccess?: Nullable<boolean>;
}

export interface RulePathResult {
    PathIds: number[];
    PathNames: string;
}

export interface CreatManyPayload {
    count?: Nullable<number>;
}

export interface ColumnInfo {
    id?: Nullable<number>;
    sensitive_results_id?: Nullable<number>;
    column_id?: Nullable<number>;
    column_name?: Nullable<string>;
    classification_name?: Nullable<string>;
    rule_id?: Nullable<number>;
    hit_rule?: Nullable<string>;
    sensitive_level?: Nullable<string>;
    attrubute_type?: Nullable<string>;
    revision_status?: Nullable<number>;
    sampling_results?: Nullable<string>;
    before_hit_rule?: Nullable<string>;
    before_hit_level?: Nullable<string>;
    create_time?: Nullable<Date>;
    update_time?: Nullable<Date>;
    is_delete?: Nullable<boolean>;
}

export interface RevisedRecord {
    id?: Nullable<number>;
    sensitive_result_id?: Nullable<number>;
    column_id?: Nullable<number>;
    column_name?: Nullable<string>;
    classification_name?: Nullable<string>;
    rule_id?: Nullable<number>;
    hit_rule?: Nullable<string>;
    sensitive_level?: Nullable<string>;
    attrubute_type?: Nullable<string>;
    revision_status?: Nullable<number>;
    sampling_results?: Nullable<string>;
    before_hit_rule?: Nullable<string>;
    before_hit_level?: Nullable<string>;
    create_time?: Nullable<Date>;
    update_time?: Nullable<Date>;
    is_delete?: Nullable<boolean>;
    sensitiveResult?: Nullable<SensitiveResult>;
    database?: Nullable<SqlInfo>;
}

export interface RevisedRecordResult {
    data?: Nullable<Nullable<RevisedRecord>[]>;
    total?: Nullable<number>;
}

export interface ColumnInfoResult {
    data?: Nullable<Nullable<ColumnInfo>[]>;
    total?: Nullable<number>;
}

export interface SensitiveResult1 {
    id?: Nullable<number>;
    classification_template_id?: Nullable<number>;
    table_name?: Nullable<string>;
    database_id?: Nullable<number>;
    total_row?: Nullable<number>;
    total_column?: Nullable<number>;
    sensitive_column?: Nullable<number>;
    hit_data?: Nullable<JSON>;
    number_cell?: Nullable<number>;
    create_time?: Nullable<Date>;
    update_time?: Nullable<Date>;
    column_info?: Nullable<JSON>;
}

export interface SensitiveResult {
    id?: Nullable<number>;
    classification_template_id?: Nullable<number>;
    table_name?: Nullable<string>;
    database_id?: Nullable<number>;
    total_row?: Nullable<number>;
    total_column?: Nullable<number>;
    sensitive_column?: Nullable<number>;
    hit_data?: Nullable<JSON>;
    number_cell?: Nullable<number>;
    create_time?: Nullable<Date>;
    update_time?: Nullable<Date>;
    is_delete?: Nullable<boolean>;
    column_info?: Nullable<JSON>;
    columnInfo?: Nullable<ColumnInfoResult>;
    sqlInfoResult?: Nullable<SqlInfoResult>;
}

export interface SensitiveResultModel {
    data?: Nullable<Nullable<SensitiveResult>[]>;
    total?: Nullable<number>;
}

export interface ModelAndRule {
    id?: Nullable<number>;
    recognition_model_id?: Nullable<number>;
    sensitive_rules_id?: Nullable<number>;
}

export interface SensitiveRule {
    id?: Nullable<number>;
    uuid?: Nullable<string>;
    name?: Nullable<string>;
    sensitiveLevelId?: Nullable<number>;
    recognitionModelId?: Nullable<number>;
    classificationTemplateId?: Nullable<number>;
    sensitiveClassificationId?: Nullable<number>;
    modelInfo?: Nullable<RecognitionModel>;
    status?: Nullable<number>;
    scanRange?: Nullable<JSON>;
    createTime?: Nullable<Date>;
    updateTime?: Nullable<Date>;
    isDelete?: Nullable<boolean>;
    attributeType?: Nullable<string>;
    describe?: Nullable<string>;
}

export interface SensitiveRuleResult {
    data?: Nullable<Nullable<SensitiveRule>[]>;
    total?: Nullable<number>;
}

export interface ModelAndRules {
    data?: Nullable<Nullable<ModelAndRule>[]>;
}

export interface CreatPayload {
    count?: Nullable<number>;
}

export interface CreateManyModelAndRulesCount {
    count?: Nullable<number>;
}

export interface DeleteSensitiveRuleResult {
    deleteSuccess?: Nullable<boolean>;
}

export interface SensitiveLevel {
    id?: Nullable<number>;
    classification_template_id?: Nullable<number>;
    type?: Nullable<number>;
    name?: Nullable<string>;
    color?: Nullable<string>;
    count?: Nullable<number>;
    describe?: Nullable<string>;
    create_time?: Nullable<Date>;
    update_time?: Nullable<Date>;
    is_delete?: Nullable<boolean>;
    isUse?: Nullable<boolean>;
}

export interface Template {
    type?: Nullable<number>;
    content?: Nullable<Content>;
}

export interface Model {
    name?: Nullable<string>;
    type?: Nullable<number>;
    SensitiveLevelId?: Nullable<number>;
    rule?: Nullable<Rule>;
    describe?: Nullable<string>;
}

export interface Content {
    describe?: Nullable<string>;
}

export interface Rule {
    type?: Nullable<number>;
    content?: Nullable<string>;
}

export interface SensitiveLevelResult {
    data?: Nullable<Nullable<SensitiveLevel>[]>;
    total?: Nullable<number>;
    onUseName?: Nullable<string>;
    onUseId?: Nullable<number>;
    onUseType?: Nullable<number>;
}

export interface ResourceInfo {
    id?: Nullable<number>;
    instance?: Nullable<string>;
    instanceAlias?: Nullable<string>;
    region?: Nullable<string>;
    province?: Nullable<string>;
    authorizedDatabase?: Nullable<number>;
    describe?: Nullable<string>;
    createTime?: Nullable<Date>;
    updateTime?: Nullable<Date>;
    sqlinfo?: Nullable<Nullable<SqlInfo>[]>;
}

export interface ResourceInfoResult {
    data?: Nullable<Nullable<ResourceInfo>[]>;
    total?: Nullable<number>;
}

export interface DeleteCount {
    count?: Nullable<number>;
}

export type JSON = any;
export type JSONdefinitions = any;
type Nullable<T> = T | null;
