'use strict';

module.exports = function(Subcategory) {


    Subcategory.validatesInclusionOf('status', { in: ['active', 'deactive']
    });


    Subcategory.activeSubcategory = function(id, callback) {
        Subcategory.findById(id, function(err, cubcategory) {
            if (err) return callback(err)
            if (cubcategory == null) {
                return callback(Subcategory.app.err.global.notFound())
            }
            if (cubcategory.status == 'active') {
                return callback(Subcategory.app.err.global.alreadyActive())
            }
            cubcategory.updateAttribute("status", "active", function(err, newSubcategory) {
                if (err) return callback(err)
                return callback(null, newSubcategory);
            })
        })
    };


    Subcategory.deactiveSubcategory = function(id, callback) {
        Subcategory.findById(id, function(err, cubcategory) {
            if (err) return callback(err)
            if (cubcategory == null) {
                return callback(Subcategory.app.err.global.notFound())
            }
            if (cubcategory.status == 'deactive') {
                return callback(Subcategory.app.err.global.alreadyDeactive())
            }
            cubcategory.updateAttribute("status", "deactive", function(err, newSubcategory) {
                if (err) return callback(err)
                return callback(null, newSubcategory);
            })
        })
    };


    Subcategory.getActiveSubcategoryBySubject = async function(subjectId, filter, callback) {
        try {
            const Subject = Subcategory.app.models.Subject
            var sub = await Subject.checkSubject(subjectId)
            if (filter == null) {
                filter = {
                    "where": {
                        "status": "active",
                        "subjectId": subjectId
                    }
                }
            } else if (filter.where == null) {
                filter.where = {
                    "status": "active",
                    "subjectId": subjectId
                }
            } else {
                filter.where.status = "active"
                filter.where.subjectId = subjectId
            }
            var subcategories = await Subcategory.find(filter)
            return subcategories
        } catch (error) {
            return callback(error)
        }
    };


    Subcategory.checkSubcategory = function(id) {
        return new Promise(function(resolve, reject) {
            Subcategory.findById(id, function(err, subcategory) {
                if (err) reject(err)
                if (subcategory == null || subcategory.status == 'deactive')
                    reject(Subcategory.app.err.global.notFound())
                resolve(subcategory)
            })
        })
    }


    Subcategory.getActiveSubcategoryBySubcategory = async function(subcategoryId, filter, callback) {
        try {
            if (filter == null) {
                filter = {
                    "where": {
                        "and": [{
                            "status": "active",
                        }]
                    }
                }
            } else if (filter.where == null) {
                filter.where = {
                    "and": [{
                        "status": "active",
                    }]
                }
            } else {
                filter.where.and.push({ "status": "active" })
            }
            if (subcategoryId) {
                var subcategory = await Subcategory.checkSubcategory(subcategoryId)
                filter.where.and.push({ subcategoryId: subcategoryId })
            }
            var subcategories = await Subcategory.find(filter)
            return subcategories
        } catch (error) {
            return callback(error)
        }
    };


    Subcategory.getActiveSubcategory = async function(subcategoryId, callback) {
        try {
            let filter = {
                "where": {
                    "and": [{
                        "status": "active",
                    }, {
                        "id": subcategoryId,
                    }]
                }
            }

            var subcategory = await Subcategory.find(filter)
            console.log(subcategory)
            return callback(null, subcategory[0])
        } catch (error) {
            return callback(error)
        }
    };



    Subcategory.addSubcategory = async function(nameEn, nameAr, subcategoryId, callback) {
        try {
            await Subcategory.app.dataSources.mainDB.transaction(async models => {
                const {
                    subCategory
                } = models
                let codeLevel = await Subcategory.getNewCodeAndLevel(subcategoryId)
                let object = Object.assign(codeLevel, { nameAr, nameEn, subcategoryId })
                let newSubcategory = await subCategory.create(object)
                callback(null, newSubcategory)
            })
        } catch (error) {
            callback(error)
        }
    }


    Subcategory.getNewCodeAndLevel = async function(subcategoryId) {
        return new Promise(async function(resolve, reject) {
            try {
                let filter = {};
                if (subcategoryId) {
                    filter = { "where": { "subcategoryId": subcategoryId }, "order": "createdAt DESC" }
                } else {
                    filter = { "where": { "level": 1 }, "order": "createdAt DESC" }
                }
                let lastChild = await Subcategory.findOne(filter);
                console.log(lastChild)
                if (subcategoryId == null) {
                    if (lastChild == null) {
                        resolve({ code: "000", level: 1 })
                    } else {
                        let baseCode = parseInt(lastChild.code.substring(lastChild.code.length - 3));
                        let newCode = leftPad(baseCode + 1, 3).toString()
                        resolve({ code: newCode, level: 1 })
                    }
                } else {
                    let parent = await Subcategory.findById(subcategoryId)
                    if (lastChild == null) {
                        resolve({ code: parent.code + "000", level: parent.level + 1 })
                    } else {
                        let baseCode = parseInt(lastChild.code.substring(lastChild.code.length - 3));
                        let newCode = parent.code + leftPad(baseCode + 1, 3).toString()
                        resolve({ code: newCode, level: parent.level + 1 })
                    }


                }
            } catch (error) {
                reject(error)
            }
        })
    }


    function leftPad(number, targetLength) {
        var output = number + '';
        while (output.length < targetLength) {
            output = '0' + output;
        }
        return output;
    }

};