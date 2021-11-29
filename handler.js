"use strict";
const patients = [
  { id: 1, name: "Mary", birthDate: "1984-11-01" },
  { id: 2, name: "John", birthDate: "1980-01-16" },
  { id: 3, name: "Josh", birthDate: "1998-06-06" },
];

const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const params = {
  TableName: "PATIENTS",
};

module.exports.getPatients = async (event) => {
  try {
    let data = await dynamoDb.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (err) {
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        errorerror: err.name ? err.name : "Exceptions",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

module.exports.getPatientById = async (event) => {
  try {
    const { patientId } = event.pathParameters;

    const data = await dynamoDb
      .get({
        ...params,
        Key: {
          patient_id: patientId,
        },
      })
      .promise();

    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "This patient does not exists" }),
      };
    }

    const patient = data.Item;

    return {
      statusCode: 200,
      body: JSON.stringify(patient, null, 2),
    };
  } catch (err) {
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        err: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknow error",
      }),
    };
  }
};

module.exports.postPatient = async (event) => {
  try {
    console.log(event);
    const timestamp = new Date().getTime;

    let data = JSON.parse(event.body);
    const { name, birthDate, email, phoneNumber } = data;

    const patient = {
      patient_id: uuidv4(),
      name,
      birthDate,
      email,
      phoneNumber,
      status: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await dynamoDb
      .put({
        TableName: "PATIENTS",
        Item: patient,
      })
      .promise();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Successfully created patient" }),
    };
  } catch (err) {
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        err: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknow error",
      }),
    };
  }
};

module.exports.updatePatient = async (event) => {
  const { patientId } = event.pathParameters;

  try {
    const timestamp = new Date().getTime();

    let data = JSON.parse(event.body);

    const { name, birthDate, email, phoneNumber } = data;

    await dynamoDb
      .update({
        ...params,
        Key: {
          patient_id: patientId,
        },
        UpdateExpression:
          "SET name = :name, birthDate = :bd, email = :email," +
          " phoneNumber = :phoneNumber, updatedAt = :updatedAt",
        ConditionExpression: "attribute_exists(patient_id)",
        ExpressionAttributeValues: {
          ":name": name,
          ":bd": birthDate,
          ":email": email,
          ":phoneNumber": phoneNumber,
          ":updatedAt": timestamp,
        },
      })
      .promise();

    return {
      statusCode: 204,
    };
  } catch (err) {
    console.log("Error", err);

    let error = err.name ? err.name : "Exception";
    let message = err.message ? err.message : "Unknown error";
    let statusCode = err.statusCode ? err.statusCode : 500;

    if (error == "ConditionalCheckFailedException") {
      error = "This patient does not exists";
      message = `It was not possible to update the patient${patientId}`;
      statusCode = 404;
    }

    return {
      statusCode,
      body: JSON.stringify({
        error,
        message,
      }),
    };
  }
};

module.exports.deletePatient = async (event) => {
  console.log(event)
  const { patientId } = event.pathParameters;

  try {
    await dynamoDb
      .delete({
        ...params,
        Key: {
          patient_id: patientId,
        },
        ConditionExpression: "attribute_exists(patient_id)",
      })
      .promise();

    return {
      statusCode: 204,
    };
  } catch (err) {
    console.log("Error", err);

    let error = err.name ? err.name : "Exception";
    let message = err.message ? err.message : "Unknown error";
    let statusCode = err.statusCode ? err.statusCode : 500;

    if (error == "ConditionalCheckFailedException") {
      error = "Non-existent patient";
      message = `Patient with ID ${patientId} cant be deleted or does not exists.`;
      statusCode = 404;
    }

    return {
      statusCode,
      body: JSON.stringify({
        error,
        message,
      }),
    };
  }
};
