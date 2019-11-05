var expect = require('chai').expect;
var request = require('request');
var url = "http://localhost:3000/api/"
var adminToken = ""


it('faild login to admin', function (done) {
  request.post(url + 'admins/login', {
    form: {
      "email": "admin@mgmt.com",
      "password": "1234567"
    }
  }, function (error, response, body) {
    expect(response.statusCode).to.equal(401);
    done();
  });
});


it('login to admin', function (done) {
  request.post(url + 'admins/login', {
    form: {
      "email": "admin@mgmt.com",
      "password": "password"
    }
  }, function (error, response, body) {
    expect(response.statusCode).to.equal(200);
    adminToken = JSON.parse(body)["id"]
    done();
  });
});


it('add institute', function (done) {
  request.post(url + 'institutes/createNewInstitute', {
    form: {
      "instituteData": {
        "nameEn": "alrayan",
        "nameAr": "الريان",
        "descriptionEn": "english languages",
        "descriptionAr": "لغة انكليزي",
        "logoId": 4,
        "dateOfIncorporation": "2019-09-24T09:53:21.623Z"
      },
      "adminData": {
        "password": "1234567",
        "phonenumber": "+963991414724",
        "name": "rami alzebk",
        "gender": "male",
        "birthdate": "Current Date and Time: Tue Sep 24 1995 13:15:03 GMT+0300 (Eastern European Summer Time)",
        "email": "rami@alrayan.com"
      }
    }
  }, function (error, response, body) {
    expect(response.statusCode).to.equal(401);
    done();
  });
});


it('add institute', function (done) {
  request.post(url + 'institutes/createNewInstitute', {
    headers: {
      "Authorization": adminToken
    },
    form: {
      "instituteData": {
        "nameEn": "alrayan",
        "nameAr": "الريان",
        "descriptionEn": "english languages",
        "descriptionAr": "لغة انكليزي",
        "logoId": 4,
        "dateOfIncorporation": "2019-09-24T09:53:21.623Z"
      },
      "adminData": {
        "password": "1234567",
        "phonenumber": "+963991414724",
        "name": "rami alzebk",
        "gender": "male",
        "birthdate": "Current Date and Time: Tue Sep 24 1995 13:15:03 GMT+0300 (Eastern European Summer Time)",
        "email": "rami@alrayan.com"
      }
    }
  }, function (error, response, body) {
    expect(response.statusCode).to.equal(200);
    done();
  });
});


it('add old  student', function (done) {
  request.post(url + 'students/addOldStudent', {
      headers: {
        "Authorization": adminToken
      },
      form: {
        "instituteId": 1,
        "branchId": 1,
        "phonenumber": "+963957465876"
      }
    },
    function (error, response, body) {
      expect(response.statusCode).to.equal(455);
      done();
    });
});


it('add new student', function (done) {
  request.post(url + 'students/addNewStudent', {
      headers: {
        "Authorization": adminToken
      },
      form: {
        "instituteId": 1,
        "branchId": 1,
        "phonenumber": "+963957465876",
        "name": "anas alazmeh",
        "gender": "male",
        "birthdate": "1995-06-25 12:24:20"
      }
    },
    function (error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
});
