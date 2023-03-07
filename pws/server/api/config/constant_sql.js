/**
 * [sql_config API details]
 * @type {Object}
 */
var sql_config = {
    "INSERT_CATEGORY_SQL": "insert into category (name,type, misc, textForPrint,statisticsGroup,statisticsSettings, vat, vat_1,vat_2,vat_3,hideBy) values (?,?,?,?,?, ?, ?, ?, ?, ?,?)",
    "UPDATE_SUPPLIER_SQL": "update category set name= ?, type= ?,misc= ? ,textForPrint= ?, statisticsGroup= ?, statisticsSettings=?,vat= ?, vat_1= ?, vat_2= ?, vat_3= ?, hideBy= ?,modified_date=CURRENT_TIMESTAMP where id= ?",
    "SELECT_CATEGORY_SQL": "select id,name,type, misc, textForPrint,statisticsGroup,statisticsSettings, vat, vat_1,vat_2,vat_3,hideBy from category",
    "DELETE_CATEGORY_SQL": "delete from category where id= ?",

    "INSERT_OBJECT_SQL": "insert into object (identifier,name,beds, location, textForPrint,features) values (?,?,?,?,?,?)",
    "SELECT_OBJECT_SQL": "select id,identifier,name,beds, location, textForPrint,features from object",
    "DELETE_OBJECT_SQL": "delete from object where id= ?",
    "UPDATE_OBJECT_SQL": "update object set identifier= ?, name= ?,beds= ? ,location= ?, textForPrint= ?, features=? where id= ?",
    "SELECT_OBJECT_BY_CATEGORY_SQL": "select id,identifier,name,beds, location, textForPrint,features from object where identifier=?",
    "COUNT_OBJECT_FOR_CATEGORY_SQL" : "select count(*) totalObject from object where identifier= ?",



    "INSERT_METADATA_SQL": "insert into params (param_category,param_name,param_value,sort_order,del_ind,created_by) values (?,?,?,?,?,?)",
    "DELETE_METADATA_SQL": "delete from params where param_category= ?",
    "COUNT_CATEGORY_METADATA_SL" : "select count(*) params from params where param_category= ?",
    "SELECT_METADATA_SQL": "select param_name name ,param_value value , sort_order sortOrder from params where param_category= ? AND del_ind = 'N'",

    "INSERT_RATES_SQL": "insert into RATES (parent_id,parent_name,rate_for,rate_type,season_strt_dt,season_strt_dt_num,season_end_dt,season_end_dt_num,calc_unit,no_of_person,week_adult_rate,week_kid1_rate,week_kid1_unit,week_kid2_rate,week_kid2_unit,weekend_adult_rate,weekend_kid1_rate,weekend_kid1_unit,weekend_kid2_rate,weekend_kid2_unit,is_Active,created_by) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    "UPDATE_RATES_SQL": "update RATES set parent_id=?,parent_name=?,rate_for=?,rate_type=?,season_strt_dt=?,season_strt_dt_num=?,season_end_dt=?,season_end_dt_num=?,calc_unit=?,no_of_person=?,week_adult_rate=?,week_kid1_rate=?,week_kid1_unit=?,week_kid2_rate=?,week_kid2_unit=?,weekend_adult_rate=?,weekend_kid1_rate=?,weekend_kid1_unit=?,weekend_kid2_rate=?,weekend_kid2_unit=?,is_Active=?,modified_by=? where rate_id=?",
    "DELETE_RATES_SQL": "delete from RATES where rate_id= ?",
    "SELECT_RATE_SQL": "select rate_id rateId,parent_id parentId,parent_name parentName,rate_for rateFor,rate_type rateType,DATE_FORMAT(season_strt_dt, '%Y-%m-%d') seasonStrtDate,DATE_FORMAT(season_end_dt, '%Y-%m-%d')  seasonEndDate,calc_unit calcUnit,no_of_person noOfPerson,week_adult_rate weekAdultRate,week_kid1_rate weekKid1Rate,week_kid1_unit weekKid1Unit,week_kid2_rate weekKid2Rate,week_kid2_unit weekKid2Unit,weekend_adult_rate weekendAdultRate,weekend_kid1_rate weekendKid1Rate,weekend_kid1_unit weekEndKid1Unit,weekend_kid2_rate weekendKid2Rate,weekend_kid2_unit weekendKid2Unit,is_Active isActive from RATES where season_end_dt_num > convert((DATE_FORMAT(NOW(), '%Y%m%d')),UNSIGNED INTEGER) or rate_type = 'D'",
    "SELECT_MENU_CATEGORY_SQL": "select category_id pmCode,category_name name,icon_name image from MENU_CATEGORIES",
    "SELCT_MENUS_SQL": "select menu_id smCode,category_id categoryId,name,menu_url url,icon_name image from MENUS where category_id=?",


    "SELECT_ROLES_TO_MENUS_SQL": "select menu_id smCode,access_type access from ROLE_ACCESS where role_id=?",
    "SELECT_ROLES_TO_MENUS_EX_NA_SQL":"select menu_id smCode,access_type access from ROLE_ACCESS where role_id=? and access_type <> 'NA'",
    "SELECT_ROLES_MENUID_TO_MENUS_SQL": "select menu_id smCode,category_id categoryId,name,menu_url url,icon_name image from MENUS where menu_id=?",
    "SELECT_ROLES_CATEGORYID_TO_CATEGORY_SQL": "select category_id pmCode,category_name name,icon_name image from MENU_CATEGORIES where category_id=?",
    "SELECT_ROLES_CATEGORY_SQL": "select category_id pmCode,category_name name,icon_name image from MENU_CATEGORIES where category_id=?",

    "SELECT_SYSTEM_ROLES_SQL": "select role_id roleId,name,description from ROLES",
    "INSERT_USERS_SQL": "insert into USERS (username,password,role_id,first_name,last_name,created_by) values (?,?,?,?,?,?)",
    "INSERT_SYSTEM_ROLES_SQL": "insert into ROLES (role_id,name,description) values (?,?,?)",

    "DELETE_ROLE": "delete from ROLE_ACCESS where role_id=?",
    "DELETE_USER_SQL": "delete from USERS where user_id=?",
    "INSERT_ROLE_ACCESS": "insert into ROLE_ACCESS  (role_id,menu_id,access_type,created_by) values(?,?,?,?)",
    "EDIT_ROLES_AND_USERS_NO_PASSWORD":"update USERS set role_id=?,first_name=?,last_name=?,modified_by=?,modified_date=? where user_id=?",
    "EDIT_ROLES_AND_USERS_WITH_PASSWORD":"update USERS set role_id=?,first_name=?,last_name=?,password=?,modified_by=?,modified_date=? where user_id=?",

    "SELECT_USERS_SQL":"select user_id userid,username,role_id roleid,first_name firstname,last_name lastname from USERS",
    "SELECT_USER_BY_USERID_SQL":"select user_id userid,username,role_id roleid,first_name firstname,last_name lastname from USERS where user_id=?",
   
    "SELECT_USERS_FROM_USERID_SQL":"select user_id userid,username,role_id roleid,first_name firstname,last_name lastname from USERS where user_id=?",

    "SELECT_USER_DETAILS_SQL":"select user_id,role_id,first_name,last_name,password from USERS where username=? and password=?",
    "UPDATE_USER_TOKEN_SQL":"update USERS set token=?,modified_date=? where username=? and password=?",
    "INSERT_ROLE_SQL":"insert into ROLES (name,description,created_by,created_date) values(?,?,?,?)"
}
module.exports = sql_config;

