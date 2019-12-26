'use strict';

const fields = {
  instituteadmin: ["id", "userInstituteId", "instituteId", "createdAt"],
  userinstitute: ["gender", "birthdate", "name", "email", "id"],
  branchadmin: ["id", "userInstituteId", "branchId", "createdAt"],
  waitingliststudent: ["id", "waitingListId", "studentId", "branchId", "note", "payment", "createdAt"],
  student: ["userId", "instituteId", "branchId", "createdAt", "id","status"],
  teacher: ["userId", "instituteId", "createdAt", "id"],
  user: ["gender", "birthdate", "name", "phonenumber", "id"],
  teachercourse: ["id", "courseId", "teacherId", "typePaid", "value", "totalPayment", "createdAt"],
  studentcourse: ["id", "courseId", "studentId", "isInQueue", "order", "createdAt"]
}

const relationName = {
  userinstitute: "userInstitute",
  student: "student",
  user: "user",
  teacher: "teacher"
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
  }
}
