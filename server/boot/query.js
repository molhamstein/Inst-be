'use strict';

const fields = {
  instituteadmin: ["id", "userInstituteId", "instituteId", "createdAt"],
  userinstitute: ["gender", "birthdate", "name", "email", "id"],
  branchadmin: ["id", "userInstituteId", "branchId", "createdAt"],
  waitingliststudent: ["id", "waitingListId", "studentId", "branchId", "note", "payment", "createdAt"],
  student: ["userId", "instituteId", "branchId", "createdAt", "id", "status", "balance", "frozenBalance"],
  teacher: ["userId", "instituteId", "createdAt", "id"],
  user: ["gender", "birthdate", "name", "phonenumber", "id"],
  teacherCourse: ["id", "courseId", "teacherId", "typePaid", "value", "balance", "createdAt"],
  studentCourse: ["id", "courseId", "studentId", "isInQueue", "order", "frozenBalance", "balance", "isBuySupplies", "cost", "createdAt"],
  session: ["id", "courseId", "venueId", "startAt", "endAt", "cost", "status", "createdAt"],
  course: ["id", "instituteId", "branchId", "venueId", "subcategoryId", "cost", "costSupplies", "typeCost", "sessionsNumber", "nameEn", "nameAr", "descriptionEn", "descriptionAr", "startAt", "maxCountStudent", "countStudent", "countStudentInQueue", "sessionAvgDuration", "waitingListId", "hasSession", "hasSpplies", "isStarted", "status", "createdAt"],
  venue: ["id", "instituteId", "branchId", "nameEn", "nameAr", "type", "status", "createdAt"]
}

const relationName = {
  userinstitute: "userInstitute",
  student: "student",
  user: "user",
  teacher: "teacher",
  course: "course",
  venue: "venue"
}

module.exports = {

  towLevel: function (app, firstTable, secondTable, firstFieldRelation, secondFieldRelation, filter, isCount) {
    return new Promise(function (resolve, reject) {
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




  threeLevel: function (app, firstTable, secondTable, thirdTable, firstFieldRelation, secondFieldRelationA, secondFieldRelationB, thirdFieldRelation, filter, isCount) {
    return new Promise(function (resolve, reject) {
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


  multiTowLevel: function (app, arrayOfTable, arrayRelation, filter) {
    return new Promise(function (resolve, reject) {
      var sql = require('sql-query');
      var sqlQuery = sql.Query();
      var sqlSelect = sqlQuery.select();
      var arraywhereObject = []
      console.log(filter.where)
      if (filter.where) {
        for (let index = 0; index < arrayOfTable.length; index++) {
          const element = arrayOfTable[index];
          arraywhereObject[index] = {}
        }

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
              arraywhereObject[0][object['key']] = object['value']
            } else {
              for (let index = 1; index < arrayOfTable.length; index++) {
                const element = arrayOfTable[index];
                if (key.lastIndexOf(element + '.') != -1) {
                  arraywhereObject[index][object['key']] = object['value']
                }
              }
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
      var query = sqlSelect
        .from(arrayOfTable[0])
        .select(fields[arrayOfTable[0]])
        .where(arrayOfTable[0], arraywhereObject[0])
      for (let index = 0; index < arrayRelation.length; index++) {
        const element = arrayRelation[index];
        query = query
          .from(arrayOfTable[element.fromTable], element['fromId'], arrayOfTable[element.mainTable], element['mainId'])
          .where(arrayOfTable[element.fromTable], arraywhereObject[element.fromTable])
      }
      query = query.build()
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
          for (let index = 0; index < resultObjects.length; index++) {
            const element = resultObjects[index];
            arrayRelation.forEach(relationElement => {
              resultObjects[index][relationName[arrayOfTable[relationElement.fromTable]]] = JSON.parse(element[relationName[arrayOfTable[relationElement.fromTable]]])
            });
          }
          resolve(resultObjects)
        } else
          reject(err)
      })

      // })
    })
  }

  // SELECT JSON_OBJECT("id",t2.id,"instituteId",t2.instituteId,"branchId",t2.branchId,"venueId",t2.venueId,"subcategoryId",t2.subcategoryId,"cost",t2.cost,"costSupplies",t2.costSupplies,"typeCost",t2.typeCost,"sessionsNumber",t2.sessionsNumber,"nameEn",t2.nameEn,"nameAr",t2.nameAr,"descriptionEn",t2.descriptionEn,"descriptionAr",t2.descriptionAr,"startAt",t2.startAt,"maxCountStudent",t2.maxCountStudent,"countStudent",t2.countStudent,"countStudentInQueue",t2.countStudentInQueue,"sessionAvgDuration",t2.sessionAvgDuration,"waitingListId",t2.waitingListId,"hasSession",t2.hasSession,"hasSpplies",t2.hasSpplies,"isStarted",t2.isStarted,"status",t2.status,"createdAt",t2.createdAt) AS course ,  `t1`.`id`, `t1`.`courseId`, `t1`.`venueId`, `t1`.`startAt`, `t1`.`endAt`, `t1`.`cost`, `t1`.`status`, `t1`.`createdAt` FROM `session` `t1` JOIN `course` `t2` ON `t2`.`id` = `t1`.`courseId` WHERE `branchId` = 1 ORDER BY `id` DESC LIMIT 0,10

}
