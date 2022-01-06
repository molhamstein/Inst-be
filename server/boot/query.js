'use strict';

const fields = {
    instituteadmin: ["id", "userInstituteId", "instituteId", "createdAt"],
    userinstitute: ["gender", "birthdate", "name", "email", "id"],
    branchadmin: ["id", "userInstituteId", "branchId", "createdAt"],
    waitingListStudent: ["id", "waitingListId", "studentId", "branchId", "note", "payment", "createdAt"],
    student: ["userId", "instituteId", "branchId", "createdAt", "id", "status", "balance", "frozenBalance"],
    youtuber: ["userId", "createdAt", "id", "status", "balance", "frozenBalance"],
    teacher: ["userId", "instituteId", "createdAt", "balance", "status", "id"],
    user: ["gender", "birthdate", "name", "phonenumber", "id", "email"],
    teacherCourse: ["id", "courseId", "teacherId", "typePaid", "value", "balance", "createdAt"],
    studentCourse: ["id", "courseId", "studentId", "isInQueue", "order", "frozenBalance", "balance", "isBuySupplies", "cost", "createdAt"],
    session: ["id", "courseId", "venueId", "startAt", "endAt", "cost", "name", "status", "createdAt"],
    course: ["id", "instituteId", "branchId", "venueId", "subcategoryId", "cost", "costSupplies", "typeCost", "sessionsNumber", "nameEn", "nameAr", "descriptionEn", "descriptionAr", "startAt", "maxCountStudent", "countStudent", "countStudentInQueue", "sessionAvgDuration", "waitingListId", "hasSession", "hasSpplies", "isStarted", "status", "createdAt", "isOnlineCourse"],
    venue: ["id", "instituteId", "branchId", "nameEn", "nameAr", "type", "status", "createdAt"],
    studentPayment: ["id", "studentId", "value", "date", "note", "courseId", "createdAt"],
    onlineSession: ["id", "courseId", "unitId", "podcastId", "duration", "nameEn", "nameAr", "descriptionEn", "descriptionAr", "mediaId", "reachCount", "viewCount", "createdAt"],
    podcast: ["id", "youtuberId", "createdAt", "subscriberCount", "subcategoryId", "status", "nameEn", "nameAr", "descriptionEn", "descriptionAr"],
    user: ['id', 'name']
}

const relationName = {
    userinstitute: "userInstitute",
    student: "student",
    user: "user",
    teacher: "teacher",
    course: "course",
    venue: "venue",
    youtuber: "youtuber",
    podcast: "podcast",

}

module.exports = {

    getSum: function(app, where, callback) {
        return new Promise(function(resolve, reject) {
            var sql = require('sql-query');
            var sqlQuery = sql.Query();
            var sqlSelect = sqlQuery.select();
            var query = sqlSelect
                .from('transaction')
                .where(where)
                .fun('SUM', 'value', "value")
                .build();
            const connector = app.dataSources.mainDB.connector;
            console.log(query)
            connector.execute(query, null, (err, resultObjects) => {
                if (!err) {
                    console.log(resultObjects[0]['value'])
                    if (resultObjects[0]['value'] == null) {

                        if (callback != undefined) {
                            callback(null, 0)
                        } else
                            resolve(0)
                    } else {
                        if (callback != undefined) {
                            callback(null, resultObjects[0]['value'])
                        } else {
                            resolve(resultObjects[0]['value'])
                        }
                    }
                } else
                if (callback) {
                    callback(err)
                } else
                    reject(err)
            })
        })
    },

    towLevel: function(app, firstTable, secondTable, firstFieldRelation, secondFieldRelation, filter, isCount) {
        return new Promise(function(resolve, reject) {
            var sql = require('sql-query');
            var sqlQuery = sql.Query();
            var sqlSelect = sqlQuery.select();
            var firstWhereObject = {};
            var secondWhereObject = {};
            var limit = 10;
            var skip = 0;
            var orderKey = "id";
            var orderType = "Z"
            if (isCount == false) {
                if (filter.where) {
                    for (var key in filter.where) {
                        var object = {}
                        if (filter.where.hasOwnProperty(key)) {
                            var n = key.lastIndexOf('.');
                            var mainKey = key.substring(n + 1);
                            var value = filter.where[key]
                            console.log("mainKey")
                            console.log(mainKey)
                            if (typeof value !== 'object') {
                                object = {
                                    "key": mainKey,
                                    "value": value
                                }
                            } else {
                                if (value['like'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.like("%" + value['like'] + "%")
                                    }
                                } else if (value['gte'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.gte(value['gte'])
                                    }
                                } else if (value['gt'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.gt(value['gt'])
                                    }
                                } else if (value['lte'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.lte(value['lte'])
                                    }
                                } else if (value['lt'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.lt(value['lt'])
                                    }
                                } else {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.ne(value['neq'])
                                    }
                                }
                            }
                            if (n == -1) {
                                firstWhereObject[object['key']] = object['value']
                            } else if (key.lastIndexOf(secondTable + '.') != -1) {
                                secondWhereObject[object['key']] = object['value']
                            }
                        }
                    }
                }
                if (filter.limit) {
                    limit = filter.limit
                }
                if (filter.skip) {
                    skip = filter.skip
                }
                if (filter.order) {
                    var m = filter.order.lastIndexOf(' ');
                    orderKey = filter.order.substring(0, m);
                    if (filter.order.lastIndexOf('ASC') != -1) {
                        orderType = "a"
                    }
                }
            } else {
                if (filter) {
                    for (var key in filter) {
                        var object = {}
                        if (filter.hasOwnProperty(key)) {
                            var n = key.lastIndexOf('.');
                            var mainKey = key.substring(n + 1);
                            var value = filter[key]
                            console.log("mainKey")
                            console.log(mainKey)
                            if (typeof value !== 'object') {
                                object = {
                                    "key": mainKey,
                                    "value": value
                                }
                            } else {
                                if (value['like'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.like("%" + value['like'] + "%")
                                    }
                                } else if (value['gte'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.gte(value['gte'])
                                    }
                                } else if (value['gt'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.gt(value['gt'])
                                    }
                                } else if (value['lte'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.lte(value['lte'])
                                    }
                                } else if (value['lt'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.lt(value['lt'])
                                    }
                                }
                            }
                            if (n == -1) {
                                firstWhereObject[object['key']] = object['value']
                            } else if (key.lastIndexOf(secondTable + '.') != -1) {
                                secondWhereObject[object['key']] = object['value']
                            }
                        }
                    }
                }
            }
            if (isCount == false) {
                var query = sqlSelect
                    .from(firstTable)
                    .select(fields[firstTable])
                    .where(firstWhereObject)
                    .from(secondTable, secondFieldRelation, firstFieldRelation)
                    .where(secondWhereObject)
                    .order(orderKey, orderType)
                    .limit(skip + "," + limit)
                    .build();
                var selectIndex = query.indexOf('SELECT') + 6
                var addedString = " JSON_OBJECT(";
                fields[secondTable].forEach(element => {
                    addedString += '"' + element + '",' + "t2." + element + ','
                });
                addedString = addedString.substring(0, addedString.length - 1);
                addedString += ') AS ' + relationName[secondTable] + ' , '
                console.log(addedString)

                query = query.slice(0, selectIndex) + addedString + query.slice(selectIndex);

            } else
                var query = sqlSelect
                    .from(firstTable)
                    .where(firstWhereObject)
                    .from(secondTable, secondFieldRelation, firstFieldRelation)
                    .where(secondWhereObject)
                    .count(null, 'count')
                    .build();
            const connector = app.dataSources.mainDB.connector;
            console.log(query)
            connector.execute(query, null, (err, resultObjects) => {
                if (!err) {
                    if (isCount)
                        resolve(resultObjects[0])
                    else {
                        for (let index = 0; index < resultObjects.length; index++) {
                            const element = resultObjects[index];
                            resultObjects[index][relationName[secondTable]] = JSON.parse(element[relationName[secondTable]])
                        }
                        resolve(resultObjects)
                    }
                } else
                    reject(err)
            })
        })
    },




    threeLevel: function(app, firstTable, secondTable, thirdTable, firstFieldRelation, secondFieldRelationA, secondFieldRelationB, thirdFieldRelation, filter, isCount) {
        return new Promise(function(resolve, reject) {
            var sql = require('sql-query');
            var sqlQuery = sql.Query();
            var sqlSelect = sqlQuery.select();
            var firstWhereObject = {};
            var secondWhereObject = {};
            var thirdWhereObject = {};
            var limit = 10;
            var skip = 0;
            var orderKey = "id";
            var orderType = "Z"
            if (isCount == false) {
                if (filter.where) {
                    for (var key in filter.where) {
                        var object = {}
                        if (filter.where.hasOwnProperty(key)) {
                            var n = key.lastIndexOf('.');
                            var mainKey = key.substring(n + 1);
                            var value = filter.where[key]
                            console.log("mainKey")
                            console.log(mainKey)
                            if (typeof value !== 'object') {
                                object = {
                                    "key": mainKey,
                                    "value": value
                                }
                            } else {
                                if (value['like'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.like("%" + value['like'] + "%")
                                    }
                                } else if (value['gte'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.gte(value['gte'])
                                    }
                                } else if (value['gt'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.gt(value['gt'])
                                    }
                                } else if (value['lte'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.lte(value['lte'])
                                    }
                                } else if (value['lt'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.lt(value['lt'])
                                    }
                                }
                            }
                            if (n == -1) {
                                firstWhereObject[object['key']] = object['value']
                            } else if (key.lastIndexOf(secondTable + '.' + thirdTable + '.') != -1) {
                                thirdWhereObject[object['key']] = object['value']
                            } else if (key.lastIndexOf(secondTable + '.') != -1) {
                                secondWhereObject[object['key']] = object['value']
                            }
                        }
                    }
                }
                if (filter.limit) {
                    limit = filter.limit
                }
                if (filter.skip) {
                    skip = filter.skip
                }
                if (filter.order) {
                    var m = filter.order.lastIndexOf(' ');
                    orderKey = filter.order.substring(0, m);
                    if (filter.order.lastIndexOf('ASC') != -1) {
                        orderType = "a"
                    }
                }
            } else {
                if (filter) {
                    for (var key in filter) {
                        var object = {}
                        if (filter.hasOwnProperty(key)) {
                            var n = key.lastIndexOf('.');
                            var mainKey = key.substring(n + 1);
                            var value = filter[key]
                            console.log("mainKey")
                            console.log(mainKey)
                            if (typeof value !== 'object') {
                                object = {
                                    "key": mainKey,
                                    "value": value
                                }
                            } else {
                                if (value['like'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.like("%" + value['like'] + "%")
                                    }
                                } else if (value['gte'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.gte(value['gte'])
                                    }
                                } else if (value['gt'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.gt(value['gt'])
                                    }
                                } else if (value['lte'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.lte(value['lte'])
                                    }
                                } else if (value['lt'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.lt(value['lt'])
                                    }
                                }
                            }
                            if (n == -1) {
                                firstWhereObject[object['key']] = object['value']
                            } else if (key.lastIndexOf(secondTable + '.' + thirdTable + '.') != -1) {
                                thirdWhereObject[object['key']] = object['value']
                            } else if (key.lastIndexOf(secondTable + '.') != -1) {
                                secondWhereObject[object['key']] = object['value']
                            }
                        }
                    }
                }
            }


            console.log("thirdWhereObject")
            console.log(thirdWhereObject)
            if (isCount == false) {
                var query = sqlSelect
                    .from(firstTable)
                    .select(fields[firstTable])
                    .where(firstWhereObject)
                    .from(secondTable, secondFieldRelationA, firstFieldRelation)
                    .where(secondWhereObject)
                    .from(thirdTable, thirdFieldRelation, secondFieldRelationB)
                    .where(thirdWhereObject)
                    .order(orderKey, orderType)
                    .limit(skip + "," + limit)
                    .build();

                var selectIndex = query.indexOf('SELECT') + 6
                var addedString = " JSON_OBJECT(";
                fields[secondTable].forEach(element => {
                    addedString += '"' + element + '",' + 't2.' + element + ','
                });
                addedString += '"' + relationName[thirdTable] + '", JSON_OBJECT('
                fields[thirdTable].forEach(element => {
                    addedString += '"' + element + '",' + 't3.' + element + ','
                });
                addedString = addedString.substring(0, addedString.length - 1);
                addedString += ')) AS ' + relationName[secondTable] + ' , '
                query = query.slice(0, selectIndex) + addedString + query.slice(selectIndex);
            } else {
                var query = sqlSelect
                    .from(firstTable)
                    .where(firstWhereObject)
                    .from(secondTable, secondFieldRelationA, firstFieldRelation)
                    .where(secondWhereObject)
                    .from(thirdTable, thirdFieldRelation, secondFieldRelationB)
                    .where(thirdWhereObject)
                    .count(null, 'count')
                    .build();
            }
            console.log(query);


            const connector = app.dataSources.mainDB.connector;
            connector.execute(query, null, (err, resultObjects) => {
                if (!err) {
                    if (isCount)
                        resolve(resultObjects[0])
                    else {
                        for (let index = 0; index < resultObjects.length; index++) {
                            const element = resultObjects[index];
                            resultObjects[index][relationName[secondTable]] = JSON.parse(element[relationName[secondTable]])
                        }
                        resolve(resultObjects)
                    }
                } else
                    reject(err)
            })

        })
    },


    multiTowLevel: function(app, arrayOfTable, arrayRelation, filter, isCount = false) {
        return new Promise(function(resolve, reject) {
            var sql = require('sql-query');
            var sqlQuery = sql.Query();
            var sqlSelect = sqlQuery.select();
            var arraywhereObject = []
            var limit = 10;
            var skip = 0;
            var orderKey = "id";
            var orderType = "Z"

            console.log(filter.where.and)
            if (filter.where && filter.where.and) {
                for (let index = 0; index < arrayOfTable.length; index++) {
                    const element = arrayOfTable[index];
                    arraywhereObject[index] = []
                }
                for (let index = 0; index < filter.where.and.length; index++) {
                    const element = filter.where.and[index];
                    console.log("element")
                    console.log(element)

                    for (var key in element) {
                        console.log("key")
                        console.log(key)
                        var object = {}
                        if (element.hasOwnProperty(key)) {
                            var n = key.lastIndexOf('.');
                            var mainKey = key.substring(n + 1);
                            var value = element[key]
                            console.log("mainKey")
                            console.log(mainKey)
                            if (typeof value !== 'object') {
                                object = {
                                    "key": mainKey,
                                    "value": value
                                }
                            } else {
                                if (value['like'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.like("%" + value['like'] + "%")
                                    }
                                } else if (value['gte'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.gte(value['gte'])
                                    }
                                } else if (value['gt'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.gt(value['gt'])
                                    }
                                } else if (value['lte'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.lte(value['lte'])
                                    }
                                } else if (value['lt'] != null) {
                                    object = {
                                        "key": mainKey,
                                        "value": sql.lt(value['lt'])
                                    }
                                }
                            }
                            if (n == -1) {
                                arraywhereObject[0].push({
                                    [object['key']]: object['value']
                                })
                            } else {
                                for (let index = 1; index < arrayOfTable.length; index++) {
                                    const element = arrayOfTable[index];
                                    if (key.lastIndexOf(element + '.') != -1) {
                                        arraywhereObject[index].push({
                                            [object['key']]: object['value']
                                        })
                                    }
                                }
                            }
                        }
                    }

                }
            }
            if (isCount == false) {
                if (filter.limit) {
                    limit = filter.limit
                }
                if (filter.skip) {
                    skip = filter.skip
                }
                if (filter.order) {
                    var m = filter.order.lastIndexOf(' ');
                    orderKey = filter.order.substring(0, m);
                    if (filter.order.lastIndexOf('ASC') != -1) {
                        orderType = "a"
                    }
                }
            }
            var query = sqlSelect
                .from(arrayOfTable[0])
                .select(fields[arrayOfTable[0]])
            for (let index = 0; index < arraywhereObject[0].length; index++) {
                const whereElement = arraywhereObject[0][index];
                query = query
                    .where(arrayOfTable[0], whereElement)
            }
            for (let index = 0; index < arrayRelation.length; index++) {
                const element = arrayRelation[index];
                query = query
                    .from(arrayOfTable[element.fromTable], element['fromId'], arrayOfTable[element.mainTable], element['mainId'])
                    // .where( arraywhereObject[element.fromTable])
                for (let whereIndex = 0; whereIndex < arraywhereObject[element.fromTable].length; whereIndex++) {
                    const whereElement = arraywhereObject[element.fromTable][whereIndex];
                    query = query
                        .where(arrayOfTable[element.fromTable], whereElement)
                }

            }
            if (isCount == false) {
                query = query
                    .order(orderKey, orderType)
                    .limit(skip + "," + limit)
                    .build()
            } else {
                query = query
                    .count(null, 'count')
                    .build()
            }
            var selectIndex = query.indexOf('SELECT') + 6
            for (let index = 0; index < arrayRelation.length; index++) {
                const relationelement = arrayRelation[index];
                var addedString = " JSON_OBJECT(";
                fields[arrayOfTable[relationelement.fromTable]].forEach(element => {
                    addedString += '"' + element + '",' + 't' + (relationelement.fromTable + 1) + '.' + element + ','
                });
                addedString = addedString.substring(0, addedString.length - 1);
                addedString += ') AS ' + relationName[arrayOfTable[relationelement.fromTable]] + ' , '
                query = query.slice(0, selectIndex) + addedString + query.slice(selectIndex);
            }
            console.log(query);
            const connector = app.dataSources.mainDB.connector;
            connector.execute(query, null, (err, resultObjects) => {
                if (!err) {
                    if (isCount)
                        resolve({ "count": resultObjects[0]["count"] })
                    else {
                        for (let index = 0; index < resultObjects.length; index++) {
                            const element = resultObjects[index];
                            arrayRelation.forEach(relationElement => {
                                resultObjects[index][relationName[arrayOfTable[relationElement.fromTable]]] = JSON.parse(element[relationName[arrayOfTable[relationElement.fromTable]]])
                            });
                        }
                    }
                    resolve(resultObjects)
                } else
                    reject(err)
            })

            // })
        })
    },

    queryGenerater: function(app, arrayOfTable, arrayRelation, filter, isCount = false) {
        return new Promise(function(resolve, reject) {
            var sql = require('sql-query');
            var sqlQuery = sql.Query();
            var sqlSelect = sqlQuery.select();
            var arraywhereObject = []
            var limit = 10;
            var skip = 0;
            var orderKey = "id";
            var orderType = "Z"
            if (filter.where && filter.where.and) {
                for (let index = 0; index < arrayOfTable.length; index++) {
                    const element = arrayOfTable[index];
                    arraywhereObject[index] = []
                }
                for (let index = 0; index < filter.where.and.length; index++) {
                    const element = filter.where.and[index];
                    for (var key in element) {
                        var object = {}
                        if (element.hasOwnProperty(key)) {
                            var n = key.lastIndexOf('.');
                            var mainKey = key.substring(n + 1);
                            var value = element[key]
                            if (value == null) {
                                object = {
                                    "key": mainKey,
                                    "value": value
                                }
                            } else if (typeof value !== 'object') {
                                object = {
                                    "key": mainKey,
                                    "value": value
                                }
                            } else if (value['like'] != null) {
                                object = {
                                    "key": mainKey,
                                    "value": sql.like("%" + value['like'] + "%")
                                }
                            } else if (value['firstlike'] != null) {
                                object = {
                                    "key": mainKey,
                                    "value": sql.like(value['firstlike'] + "%")
                                }
                            } else if (value['lastlike'] != null) {
                                object = {
                                    "key": mainKey,
                                    "value": sql.like("%" + value['lastlike'])
                                }
                            } else if (value['gte'] != null) {
                                object = {
                                    "key": mainKey,
                                    "value": sql.gte(value['gte'])
                                }
                            } else if (value['gt'] != null) {
                                object = {
                                    "key": mainKey,
                                    "value": sql.gt(value['gt'])
                                }
                            } else if (value['lte'] != null) {
                                object = {
                                    "key": mainKey,
                                    "value": sql.lte(value['lte'])
                                }
                            } else if (value['lt'] != null) {
                                object = {
                                    "key": mainKey,
                                    "value": sql.lt(value['lt'])
                                }
                            } else {
                                object = {
                                    "key": mainKey,
                                    "value": sql.ne(value['neq'])
                                }
                            }

                            if (n == -1) {
                                arraywhereObject[0].push({
                                    [object['key']]: object['value']
                                })
                            } else {
                                for (let index = 1; index < arrayOfTable.length; index++) {
                                    const element = arrayOfTable[index];
                                    if (key.lastIndexOf(element + '.') != -1) {
                                        arraywhereObject[index].push({
                                            [object['key']]: object['value']
                                        })
                                    }
                                }
                            }
                        }
                    }
                }
            }


            if (isCount == false) {
                if (filter.limit) {
                    limit = filter.limit
                }
                if (filter.skip) {
                    skip = filter.skip
                }
                if (filter.order) {
                    var m = filter.order.lastIndexOf(' ');
                    orderKey = filter.order.substring(0, m);
                    if (filter.order.lastIndexOf('ASC') != -1) {
                        orderType = "a"
                    }
                }
            }

            var query = sqlSelect
                .from(arrayOfTable[0])
                .select(fields[arrayOfTable[0]])
            for (let index = 0; index < arraywhereObject[0].length; index++) {
                const whereElement = arraywhereObject[0][index];
                query = query
                    .where(arrayOfTable[0], whereElement)
            }


            for (let index = 0; index < arrayRelation.length; index++) {
                const element = arrayRelation[index];
                if (element.joinType == null)
                    query = query
                    .from(arrayOfTable[element.fromTable], element['fromId'], arrayOfTable[element.mainTable], element['mainId'])
                else
                    query = query
                    .from(arrayOfTable[element.fromTable], element['fromId'], arrayOfTable[element.mainTable], element['mainId'], { joinType: element.joinType })

                for (let whereIndex = 0; whereIndex < arraywhereObject[element.fromTable].length; whereIndex++) {
                    const whereElement = arraywhereObject[element.fromTable][whereIndex];
                    query = query
                        .where(arrayOfTable[element.fromTable], whereElement)
                }
            }

            if (isCount == false) {
                query = query
                    .order(orderKey, orderType)
                    .limit(skip + "," + limit)
                    .build()
            } else {
                query = query
                    // .count(null, 'count')
                    .build()
            }


            var selectIndex = query.indexOf('SELECT') + 6
            for (let index = 0; index < arrayRelation.length; index++) {
                const relationelement = arrayRelation[index];
                var addedString = " JSON_OBJECT(";
                fields[arrayOfTable[relationelement.fromTable]].forEach(element => {
                    addedString += '"' + element + '",' + 't' + (relationelement.fromTable + 1) + '.' + element + ','
                });
                addedString = addedString.substring(0, addedString.length - 1);
                addedString += ') AS ' + relationelement.relationName + ' , '
                query = query.slice(0, selectIndex) + addedString + query.slice(selectIndex);
            }

            console.log("query");
            console.log(query);

            const connector = app.dataSources.mainDB.connector;
            connector.execute(query, null, (err, resultObjects) => {
                if (!err) {
                    if (isCount)
                        resolve({ "count": resultObjects.length })
                    else {
                        for (let index = 0; index < resultObjects.length; index++) {
                            const element = resultObjects[index];
                            arrayRelation.forEach(relationElement => {
                                console.log(relationElement)
                                resultObjects[index][relationElement.relationName] = JSON.parse(element[relationElement.relationName])
                            });
                        }
                    }
                    resolve(resultObjects)
                } else
                    reject(err)
            })

        })
    },


    getStudentCourse: function(app, isCount, searchKey, studentId, limit = 10, skip = 0) {
        return new Promise(function(resolve, reject) {

            if (!isCount)
                var query = 'SELECT JSON_OBJECT("gender",t4.gender,"birthdate",t4.birthdate,"name",t4.name,"phonenumber",t4.phonenumber,"id",t4.id) AS user ,  JSON_OBJECT("userId",t3.userId,"instituteId",t3.instituteId,"branchId",t3.branchId,"createdAt",t3.createdAt,"id",t3.id,"status",t3.status,"balance",t3.balance,"frozenBalance",t3.frozenBalance) AS student ,  JSON_OBJECT("id",t2.id,"instituteId",t2.instituteId,"branchId",t2.branchId,"venueId",t2.venueId,"subcategoryId",t2.subcategoryId,"cost",t2.cost,"costSupplies",t2.costSupplies,"typeCost",t2.typeCost,"sessionsNumber",t2.sessionsNumber,"nameEn",t2.nameEn,"nameAr",t2.nameAr,"descriptionEn",t2.descriptionEn,"descriptionAr",t2.descriptionAr,"startAt",t2.startAt,"maxCountStudent",t2.maxCountStudent,"countStudent",t2.countStudent,"countStudentInQueue",t2.countStudentInQueue,"sessionAvgDuration",t2.sessionAvgDuration,"waitingListId",t2.waitingListId,"hasSession",t2.hasSession,"hasSpplies",t2.hasSpplies,"isStarted",t2.isStarted,"status",t2.status,"createdAt",t2.createdAt) AS course ,  `t1`.`id`, `t1`.`courseId`, `t1`.`studentId`, `t1`.`isInQueue`, `t1`.`order`, `t1`.`frozenBalance`, `t1`.`balance`, `t1`.`isBuySupplies`, `t1`.`cost`, `t1`.`createdAt` FROM (( `studentCourse` `t1` JOIN `course` `t2` ON `t2`.`id` = `t1`.`courseId` ) JOIN `student` `t3` ON `t3`.`id` = `t1`.`studentId` ) JOIN `user` `t4` ON `t4`.`id` = `t3`.`userId` WHERE (`t1`.`studentId` = ' + studentId + ' AND (`t2`.`nameEn` LIKE \'%' + searchKey + '%\' OR `t2`.`nameAr` LIKE \'' + searchKey + '\')) ORDER BY `id` DESC LIMIT' + skip + ',' + limit
            else
                var query = 'SELECT COUNT(*) AS count, JSON_OBJECT("gender",t4.gender,"birthdate",t4.birthdate,"name",t4.name,"phonenumber",t4.phonenumber,"id",t4.id) AS user ,  JSON_OBJECT("userId",t3.userId,"instituteId",t3.instituteId,"branchId",t3.branchId,"createdAt",t3.createdAt,"id",t3.id,"status",t3.status,"balance",t3.balance,"frozenBalance",t3.frozenBalance) AS student ,  JSON_OBJECT("id",t2.id,"instituteId",t2.instituteId,"branchId",t2.branchId,"venueId",t2.venueId,"subcategoryId",t2.subcategoryId,"cost",t2.cost,"costSupplies",t2.costSupplies,"typeCost",t2.typeCost,"sessionsNumber",t2.sessionsNumber,"nameEn",t2.nameEn,"nameAr",t2.nameAr,"descriptionEn",t2.descriptionEn,"descriptionAr",t2.descriptionAr,"startAt",t2.startAt,"maxCountStudent",t2.maxCountStudent,"countStudent",t2.countStudent,"countStudentInQueue",t2.countStudentInQueue,"sessionAvgDuration",t2.sessionAvgDuration,"waitingListId",t2.waitingListId,"hasSession",t2.hasSession,"hasSpplies",t2.hasSpplies,"isStarted",t2.isStarted,"status",t2.status,"createdAt",t2.createdAt) AS course ,  `t1`.`id`, `t1`.`courseId`, `t1`.`studentId`, `t1`.`isInQueue`, `t1`.`order`, `t1`.`frozenBalance`, `t1`.`balance`, `t1`.`isBuySupplies`, `t1`.`cost`, `t1`.`createdAt` FROM (( `studentCourse` `t1` JOIN `course` `t2` ON `t2`.`id` = `t1`.`courseId` ) JOIN `student` `t3` ON `t3`.`id` = `t1`.`studentId` ) JOIN `user` `t4` ON `t4`.`id` = `t3`.`userId` WHERE (`t1`.`studentId` = ' + studentId + ' AND (`t2`.`nameEn` LIKE \'%' + searchKey + '%\' OR `t2`.`nameAr` LIKE \'' + searchKey + '\'))'
            const connector = app.dataSources.mainDB.connector;
            console.log(query)
            connector.execute(query, null, (err, resultObjects) => {
                if (!err) {
                    if (isCount)
                        resolve({ "count": resultObjects[0]["count"] })
                    else {
                        for (let index = 0; index < resultObjects.length; index++) {
                            const element = resultObjects[index];
                            resultObjects[index]['user'] = JSON.parse(element['user'])
                            resultObjects[index]['student'] = JSON.parse(element['student'])
                            resultObjects[index]['course'] = JSON.parse(element['course'])
                        }
                        resolve(resultObjects)
                    }
                } else
                    reject(err)
            })
        })
    },

    getOnlineCourses: function(app, searchKey = "", code = "", minPrice, maxPrice, youtuberId, limit = 10, skip = 0) {
        return new Promise(function(resolve, reject) {
            let query = 'SELECT JSON_OBJECT("userId",t2.userId,"createdAt",t2.createdAt,"id",t2.id,"status",t2.status,"balance",t2.balance,"frozenBalance",t2.frozenBalance,"user", JSON_OBJECT("gender",t3.gender,"birthdate",t3.birthdate,"name",t3.name,"phonenumber",t3.phonenumber,"id",t3.id,"email",t3.email)) AS youtuber ,JSON_OBJECT("nameAr",t4.nameAr,"nameEn",t4.nameEn,"createdAt",t4.createdAt,"id",t4.id,"status",t4.status,"code",t4.code) AS subcategory ,  `t1`.`id`, `t1`.`instituteId`, `t1`.`branchId`, `t1`.`venueId`, `t1`.`subcategoryId`, `t1`.`cost`,`t1`.`discountCost`, `t1`.`costSupplies`, `t1`.`typeCost`, `t1`.`sessionsNumber`, `t1`.`nameEn`, `t1`.`nameAr`, `t1`.`descriptionEn`, `t1`.`descriptionAr`, `t1`.`startAt`, `t1`.`maxCountStudent`, `t1`.`countStudent`, `t1`.`countStudentInQueue`, `t1`.`sessionAvgDuration`, `t1`.`waitingListId`, `t1`.`hasSession`, `t1`.`hasSpplies`, `t1`.`isStarted`, `t1`.`status`, `t1`.`createdAt`, `t1`.`isOnlineCourse` FROM ( `course` `t1` JOIN `subCategory` `t4` ON `t4`.`id` = `t1`.`subCategoryId` JOIN `youtuber` `t2` ON `t2`.`id` = `t1`.`youtuberId` ) JOIN `user` `t3` ON `t3`.`id` = `t2`.`userId`  WHERE `isOnlineCourse` = true AND `t1`.`status` = "active" AND (`t1`.`nameEn` LIKE "%' + searchKey + '%" OR `t1`.`nameAr` LIKE "%' + searchKey + '%" OR `t1`.`descriptionEn` LIKE "%' + searchKey + '%" OR `t1`.`descriptionAr` LIKE "%' + searchKey + '%" OR `t3`.`name` LIKE "%' + searchKey + '%" OR `t4`.`nameEn` LIKE "%' + searchKey + '%" OR `t4`.`nameAr` LIKE "%' + searchKey + '%") AND `t4`.`code` LIKE "%' + code + '%" ';

            if (minPrice) {
                query += ' AND ( `t1`.`cost` >= ' + minPrice + ' OR `t1`.`discountCost` >= ' + minPrice + ') '
            }

            if (maxPrice) {
                query += ' AND ( `t1`.`cost` <= ' + maxPrice + ' OR `t1`.`discountCost` <= ' + maxPrice + ') '
            }

            if (youtuberId) {
                query += ' AND `t2`.`id` = ' + youtuberId
            }

            query += ' ORDER BY `id` DESC LIMIT ' + skip + ',' + limit + ''
            const connector = app.dataSources.mainDB.connector;
            console.log(query)
            connector.execute(query, null, (err, resultObjects) => {
                let ids = []
                if (!err) {
                    // if (isCount)
                    //   resolve({ "count": resultObjects[0]["count"] })
                    // else {
                    for (let index = 0; index < resultObjects.length; index++) {
                        const element = resultObjects[index];
                        ids.push(element.id)
                            // resultObjects[index]['user'] = JSON.parse(element['user'])
                            // resultObjects[index]['yout'] = JSON.parse(element['student'])
                            // resultObjects[index]['course'] = JSON.parse(element['course'])
                    }
                    resolve(ids)
                        // }
                } else
                    reject(err)
            })
        })
    },

    getPodcast: function(app, searchKey = "", code = "", youtuberId, limit = 10, skip = 0) {
        return new Promise(function(resolve, reject) {
            let query = 'SELECT JSON_OBJECT("userId",t2.userId,"createdAt",t2.createdAt,"id",t2.id,"status",t2.status,"balance",t2.balance,"frozenBalance",t2.frozenBalance,"user", JSON_OBJECT("gender",t3.gender,"birthdate",t3.birthdate,"name",t3.name,"phonenumber",t3.phonenumber,"id",t3.id,"email",t3.email)) AS youtuber ,JSON_OBJECT("nameAr",t4.nameAr,"nameEn",t4.nameEn,"createdAt",t4.createdAt,"id",t4.id,"status",t4.status,"code",t4.code) AS subcategory ,  `t1`.`id`,  `t1`.`subcategoryId`, `t1`.`nameEn`, `t1`.`nameAr`, `t1`.`descriptionEn`, `t1`.`descriptionAr`,  `t1`.`status`, `t1`.`createdAt`  FROM ( `podcast` `t1` JOIN `subCategory` `t4` ON `t4`.`id` = `t1`.`subCategoryId` JOIN `youtuber` `t2` ON `t2`.`id` = `t1`.`youtuberId` ) JOIN `user` `t3` ON `t3`.`id` = `t2`.`userId`  WHERE  (`t1`.`nameEn` LIKE "%' + searchKey + '%" OR `t1`.`nameAr` LIKE "%' + searchKey + '%" OR `t1`.`descriptionEn` LIKE "%' + searchKey + '%" OR `t1`.`descriptionAr` LIKE "%' + searchKey + '%" OR `t3`.`name` LIKE "%' + searchKey + '%" OR `t4`.`nameEn` LIKE "%' + searchKey + '%" OR `t4`.`nameAr` LIKE "%' + searchKey + '%") AND `t4`.`code` LIKE "%' + code + '%" ';


            if (youtuberId) {
                query += ' AND `t2`.`id` = ' + youtuberId
            }

            query += ' ORDER BY `id` DESC LIMIT ' + skip + ',' + limit + ''
            const connector = app.dataSources.mainDB.connector;
            console.log(query)
            connector.execute(query, null, (err, resultObjects) => {
                let ids = []
                if (!err) {
                    // if (isCount)
                    //   resolve({ "count": resultObjects[0]["count"] })
                    // else {
                    for (let index = 0; index < resultObjects.length; index++) {
                        const element = resultObjects[index];
                        ids.push(element.id)
                            // resultObjects[index]['user'] = JSON.parse(element['user'])
                            // resultObjects[index]['yout'] = JSON.parse(element['student'])
                            // resultObjects[index]['course'] = JSON.parse(element['course'])
                    }
                    resolve(ids)
                        // }
                } else
                    reject(err)
            })
        })
    },


    getLoggedSubscribePodcast: function(app, filterLogged) {
        return new Promise(function(resolve, reject) {

            let query = `SELECT DATE(createdAt) AS saledate, COUNT(*) AS count FROM podcastSubscribe `
            if (filterLogged.from && filterLogged.to) {
                query += " WHERE `createdAt` > '" + filterLogged.from + "' AND `createdAt` < '" + filterLogged.to + "' "
            }
            query += " GROUP BY saledate"
            const connector = app.dataSources.mainDB.connector;
            connector.execute(query, null, (err, resultObjects) => {
                if (!err) {
                    resolve(resultObjects)
                } else
                    reject(err)
            })

        })
    },
    getLoggedEnrollCourse: function(app, filterLogged) {
        return new Promise(function(resolve, reject) {

            let query = `SELECT DATE(createdAt) AS saledate, COUNT(*) AS count FROM youtuberCourse `
            if (filterLogged.from && filterLogged.to) {
                query += " WHERE `createdAt` > '" + filterLogged.from + "' AND `createdAt` < '" + filterLogged.to + "' "
            }
            query += " GROUP BY saledate"
            const connector = app.dataSources.mainDB.connector;
            connector.execute(query, null, (err, resultObjects) => {
                if (!err) {
                    resolve(resultObjects)
                } else
                    reject(err)
            })

        })
    },
    getLoggedViews: function(app, filterLogged) {
        return new Promise(function(resolve, reject) {

            let query = `SELECT DATE(createdAt) AS saledate, COUNT(*) AS count FROM onlineSessionWatch `
            if (filterLogged.from && filterLogged.to) {
                query += " WHERE `createdAt` > '" + filterLogged.from + "' AND `createdAt` < '" + filterLogged.to + "' "
            }
            query += " GROUP BY saledate"

            const connector = app.dataSources.mainDB.connector;
            connector.execute(query, null, (err, resultObjects) => {
                if (!err) {
                    resolve(resultObjects)
                } else
                    reject(err)
            })

        })
    },
    getLoggedActiveUser: function(app, filterLogged) {
        return new Promise(function(resolve, reject) {

            let query = `SELECT DATE(createdAt) AS saledate, COUNT(*) AS count FROM logged`
            if (filterLogged.from && filterLogged.to) {
                query += " WHERE `createdAt` > '" + filterLogged.from + "' AND `createdAt` < '" + filterLogged.to + "' "
            }
            query += " GROUP BY saledate"
            const connector = app.dataSources.mainDB.connector;
            connector.execute(query, null, (err, resultObjects) => {
                if (!err) {
                    resolve(resultObjects)
                } else
                    reject(err)
            })

        })
    },
    getLoggedUser: function(app, filterLogged) {
        return new Promise(function(resolve, reject) {

            let query = `SELECT DATE(createdAt) AS saledate, COUNT(*) AS count FROM youtuber`
            if (filterLogged.from && filterLogged.to) {
                query += " WHERE `createdAt` > '" + filterLogged.from + "' AND `createdAt` < '" + filterLogged.to + "' "
            }
            query += " GROUP BY saledate"
            const connector = app.dataSources.mainDB.connector;
            connector.execute(query, null, (err, resultObjects) => {
                if (!err) {
                    resolve(resultObjects)
                } else
                    reject(err)
            })

        })
    },
    getTransactionsReport: function(app, filterLogged) {
        return new Promise(function(resolve, reject) {

            let query = `SELECT DATE(createdAt) AS saledate, SUM(value) AS totalValue, SUM(CASE WHEN isToSystem THEN value ELSE 0 END) AS systemValue FROM transaction`
            if (filterLogged.from && filterLogged.to) {
                query += " WHERE `createdAt` > '" + filterLogged.from + "' AND `createdAt` < '" + filterLogged.to + "' "
            }
            query += " GROUP BY saledate"
            console.log(query)
            const connector = app.dataSources.mainDB.connector;
            connector.execute(query, null, (err, resultObjects) => {
                if (!err) {
                    resolve(resultObjects)
                } else
                    reject(err)
            })

        })
    }




}