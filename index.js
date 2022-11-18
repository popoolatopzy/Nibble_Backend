// const { json } = require("express");
const express = require("express");
const axios = require("axios");
const app = express();
var qs = require("qs");

const port = process.env.PORT || 3000;

const x_api_key = "test_ucc8c5fyl6rl78idn3lqjp:ogINip3R6hrzzARkTI42vv13ybY";
const app_id = "3789fcc4-e27c-46d5-b270-4f7adc6922ab";
const baseURL = "https://sandbox.myIdentityPass.com/api/v2/";
var bodyParser = require("body-parser");
// const fetch = require(fetch);

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

var mysql = require("mysql");
// const { default: fetch } = require("fetch");

var con = mysql.createConnection({
  host: "sql10.freemysqlhosting.net", //sql5.freemysqlhosting.net
  user: "sql10574116",
  password: "UUjIk8hJN2",
  database: "sql10574116",
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email != "" && password != "") {
    con.query(
      `SELECT * FROM UserInfo WHERE Email = '${email}' and Password='${password}' `,
      function (err, row) {
        console.log(row.length);
        if (row.length == 1) {
          res.json({
            status: "success",
            message: "login successfull",
            data: {
              user_id: row[0].ID,
              email: row[0].Email,
            },
          });
        } else {
          res.json({
            status: "error",
            message: "Invalid email/password",
          });
        }
      }
    );
  } else {
    res.json({
      status: "error",
      message: "login failed",
    });
  }
});

app.post("/api/users", function (req, res) {
  const fullname = req.body.fullname;
  const email = req.body.email;
  const phone = req.body.phone;
  const password = req.body.password;

  if (fullname != "" && email != "" && phone != "" && password != "") {
    con.query(
      `SELECT * FROM UserInfo WHERE Email = '${email}'`,
      function (err, row) {
        // console.log(row.length);
        if (row.length == 0) {
          let sql = `INSERT INTO UserInfo(FullName,Email,Phone,Password,Status)VALUES('${fullname}','${email}','${phone}','${password}','Active')`;

          con.query(sql, function (err, result) {
            console.log(result.insertId);
            var sql2 = `INSERT INTO cac(UserID)VALUES('${result.insertId}')`;
            con.query(sql2, function (err2, result2) {});
            var sql3 = `INSERT INTO bvn(UserID)VALUES('${result.insertId}')`;
            con.query(sql3, function (err3, result3) {});
            var sql4 = `INSERT INTO nin(UserID1)VALUES('${result.insertId}')`;
            con.query(sql4, function (err4, result4) {});
            res.json({
              status: "success",
              message: "Signup successfull",
              data: {
                user_id: result.insertId,
              },
            });
          });
        } else {
          res.json({
            status: "error",
            message: "Email already exit",
          });
        }
      }
    );
  } else {
    res.json({
      status: "error",
      message: "login failed",
    });
  }
});

app.post("/api/verify/cac", async (req, res) => {
  const UserID = req.body.userid; // "3"; //

  con.query(
    `SELECT * FROM cac WHERE UserID = '${UserID}' and Status='Pending'`,
    function (err, row) {
      if (row.length == 1) {
        var data = qs.stringify({
          rc_number: req.body.rc_number, // "092932", //
          company_type: req.body.company_type, //, "RC", //
        });
        var config = {
          method: "post",
          url: baseURL + "biometrics/merchant/data/verification/cac",
          headers: {
            "x-api-key": x_api_key,
            "app-id": app_id,
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: "cookiesession1=678A3E7699990BCBDE6959ACDB0E668B",
          },
          data: data,
        };

        axios(config)
          .then(function (response) {
            let sql2 = `UPDATE cac SET Status='Verified', rc_number='${response.data.data.rc_number}',company_name='${response.data.data.company_name}',state='${response.data.data.state}',company_address='${response.data.data.company_address}',company_status='${response.data.data.company_status}',city='${response.data.data.city}',branchAddress='${response.data.data.branchAddress}',lga='${response.data.data.lga}',registrationDate='${response.data.data.registrationDate}',email_address='${response.data.data.email_address}' WHERE UserID='${UserID}'`;
            //,company_name='${response.data.data.company_name}'
            con.query(sql2, function (err2, result2) {});
            res.json({
              status: "success",
              message: "verification successfull",
            });

            // console.log(JSON.stringify(response.data.data.rc_number));
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        res.json({
          status: "error",
          message: "CAC have once be verified",
        });
      }
    }
  );
});

app.post("/api/verify/bvn", async (req, res) => {
  const UserID = req.body.userid; //  "3"; //

  con.query(
    `SELECT * FROM bvn WHERE UserID = '${UserID}' and Status='Pending'`,
    function (err, row) {
      if (row.length == 1) {
        var data = JSON.stringify({
          number: req.body.number, //"54651333604", //
        });

        var config = {
          method: "post",
          url: "https://sandbox.myidentitypass.com/api/v2/biometrics/merchant/data/verification/bvn",
          headers: {
            "x-api-key": x_api_key,
            "app-id": app_id,
            "Content-Type": "application/json",
            Cookie: "cookiesession1=678A3E7699990BCBDE6959ACDB0E668B",
          },
          data: data,
        };

        axios(config)
          .then(function (response) {
            console.log(JSON.stringify(response.data.bvn_data.title));
            let sql2 = `UPDATE bvn SET Status='Verified', title='${response.data.bvn_data.title}',gender='${response.data.bvn_data.gender}',
      maritalStatus='${response.data.bvn_data.maritalStatus}',watchListed='${response.data.bvn_data.watchListed}',
      levelOfAccount='${response.data.bvn_data.levelOfAccount}',bvn='${response.data.bvn_data.bvn}',
      firstName='${response.data.bvn_data.firstName}',middleName='${response.data.bvn_data.middleName}',
      lastName='${response.data.bvn_data.lastName}',dateOfBirth='${response.data.bvn_data.dateOfBirth}',
      phoneNumber1='${response.data.bvn_data.phoneNumber1}',registrationDate='${response.data.bvn_data.registrationDate}',
      enrollmentBank='${response.data.bvn_data.enrollmentBank}', enrollmentBranch='${response.data.bvn_data.enrollmentBranch}',
      email='${response.data.bvn_data.email}',lgaOfOrigin='${response.data.bvn_data.lgaOfOrigin}',lgaOfResidence='${response.data.bvn_data.lgaOfResidence}',nin='${response.data.bvn_data.nin}' WHERE UserID='${UserID}'`;

            con.query(sql2, function (err2, result2) {});
            res.json({
              status: "success",
              message: "verification successfull",
            });

            // console.log(JSON.stringify(response.data.data.rc_number));
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        res.json({
          status: "error",
          message: "BVN have once be verify",
        });
      }
    }
  );
});

app.post("/api/verify/nin", async (req, res) => {
  const UserID = req.body.userid; //  "3"; //

  con.query(
    `SELECT * FROM nin WHERE UserID1 = '${UserID}' and Status='Pending'`,
    function (err, row) {
      if (row.length == 1) {
        var data = JSON.stringify({
          number: req.body.number, // "AA1234567890123B",
        });

        var config = {
          method: "post",
          url: "https://sandbox.myidentitypass.com/api/v2/biometrics/merchant/data/verification/nin_wo_face",
          headers: {
            "x-api-key": x_api_key,
            "app-id": app_id,
            "Content-Type": "application/json",
            Cookie: "cookiesession1=678A3E7699990BCBDE6959ACDB0E668B",
          },
          data: data,
        };

        axios(config)
          .then(function (response) {
            // console.log(JSON.stringify(response.data.nin_data.title));
            let sql2 = `UPDATE nin SET Status='Verified', firstname='${response.data.nin_data.firstname}',surname='${response.data.nin_data.surname}',
      middlename='${response.data.nin_data.middlename}',birthdate='${response.data.nin_data.birthdate}',
      userid='${response.data.nin_data.userid}',gender='${response.data.nin_data.gender}',
      telephoneno='${response.data.nin_data.telephoneno}',vnin='${response.data.nin_data.vnin}',
      	birthstate='${response.data.nin_data.birthstate}',residence_state='${response.data.nin_data.residence_state}',
      residence_address='${response.data.nin_data.residence_address}' WHERE UserID1='${UserID}'`;

            con.query(sql2, function (err2, result2) {});
            res.json({
              status: "success",
              message: "verification successfull",
            });

            // console.log(JSON.stringify(response.data.data.rc_number));
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        res.json({
          status: "error",
          message: "BVN have once be verify",
        });
      }
    }
  );
});

app.post("/api/b/bvn", (req, res) => {
  const userid = req.body.userid; //"3";
  if (userid != "") {
    con.query(
      `SELECT * FROM bvn WHERE UserID = '${userid}' and Status='Verified'`,
      function (err, row) {
        if (row.length == 1) {
          res.json({
            status: "success",
            message: "successfull",
            data: { row },
          });
        } else {
          res.json({
            status: "error",
            message: "User BVN is not verify",
          });
        }
      }
    );
  } else {
    res.json({
      status: "error",
      message: "userid is empty",
    });
  }
});

app.post("/api/b/cac", (req, res) => {
  const userid = req.body.userid; //"3";
  if (userid != "") {
    con.query(
      `SELECT * FROM cac WHERE UserID = '${userid}' and Status='Verified'`,
      function (err, row) {
        if (row.length == 1) {
          res.json({
            status: "success",
            message: "successfull",
            data: { row },
          });
        } else {
          res.json({
            status: "error",
            message: "User CAC is not verify",
          });
        }
      }
    );
  } else {
    res.json({
      status: "error",
      message: "userid is empty",
    });
  }
});

app.post("/api/b/nin", (req, res) => {
  const userid = req.body.userid; //"3";
  if (userid != "") {
    con.query(
      `SELECT * FROM nin WHERE UserID1 = '${userid}' and Status='Verified'`,
      function (err, row) {
        if (row.length == 1) {
          res.json({
            status: "success",
            message: "successfull",
            data: { row },
          });
        } else {
          res.json({
            status: "error",
            message: "User CAC is not verify",
          });
        }
      }
    );
  } else {
    res.json({
      status: "error",
      message: "userid is empty",
    });
  }
});

app.post("/api/business/signup", function (req, res) {
  const fullname = req.body.fullname;
  const email = req.body.email;
  const password = req.body.password;

  if (fullname != "" && email != "" && password != "") {
    con.query(
      `SELECT * FROM agent WHERE email = '${email}'`,
      function (err, row) {
        // console.log(row.length);
        var crypto = require("crypto");

        var mykey = crypto.createCipher(email, password);
        var mystr = mykey.update("abc", "utf8", "hex");
        mystr += mykey.final("hex");
        if (row.length == 0) {
          let sql = `INSERT INTO agent(fullname,email,password,apikey)VALUES('${fullname}','${email}','${password}','${mystr})`;

          con.query(sql, function (err, result) {
            console.log(result.insertId);
            res.json({
              status: "success",
              message: "Signup successfull",
              data: {
                bussinessID: result.insertId,
              },
            });
          });
        } else {
          res.json({
            status: "error",
            message: "Email already exit",
          });
        }
      }
    );
  } else {
    res.json({
      status: "error",
      message: "login failed",
    });
  }
});
app.post("/api/business/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email != "" && password != "") {
    con.query(
      `SELECT * FROM agent WHERE email='${email}' and password='${password}'`,
      function (err, row) {
        console.log(row.length);
        if (row.length == 1) {
          res.json({
            status: "success",
            message: "login successfull",
            data: {
              businessID: row[0].ID,
              email: row[0].Email,
            },
          });
        } else {
          res.json({
            status: "error",
            message: "Invalid email/password",
          });
        }
      }
    );
  } else {
    res.json({
      status: "error",
      message: "login failed",
    });
  }
});
app.post("/api/business/info", (req, res) => {
  const agentid = req.body.agentid; //"3";
  if (agentid != "") {
    con.query(
      `SELECT * FROM agent WHERE ID = '${agentid}'`,
      function (err, row) {
        if (row.length == 1) {
          res.json({
            status: "success",
            message: "successfull",
            data: { row },
          });
        } else {
          res.json({
            status: "error",
            message: "Business ID not found",
          });
        }
      }
    );
  } else {
    res.json({
      status: "error",
      message: "userid is empty",
    });
  }
});

app.post("/api/businesses/list", (req, res) => {
  // const agentid = req.body.agentid; //"3";
  const userid = 3; //req.body.userid; //"3";
  if (userid != "") {
    con.query(
      `SELECT * FROM businesses WHERE userID = '${userid}'`,
      function (err, row) {
        if (row.length > 0) {
          res.json({
            status: "success",
            message: "successfull",
            data: { row },
          });
        } else {
          res.json({
            status: "error",
            message: "Your account is not link to any business yet",
          });
        }
      }
    );
  } else {
    res.json({
      status: "error",
      message: "userid is empty",
    });
  }
});
// app.post("/api/businesses/list", (req, res) => {
//   // const agentid = req.body.agentid; //"3";
//   const userid = 3; //req.body.userid; //"3";
//   if (userid != "") {
//     con.query(
//       `SELECT * FROM businesses WHERE userID = '${userid}'`,
//       function (err, row) {
//         if (row.length > 0) {
//           res.json({
//             status: "success",
//             message: "successfull",
//             data: { row },
//           });
//         } else {
//           res.json({
//             status: "error",
//             message: "Your account is not link to any business yet",
//           });
//         }
//       }
//     );
//   } else {
//     res.json({
//       status: "error",
//       message: "userid is empty",
//     });
//   }
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
