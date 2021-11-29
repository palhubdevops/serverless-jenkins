const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const timestamp = new Date().getTime;

const proxyquire = require("proxyquire").noCallThru();
const { expect } = chai;

chai.should();
chai.use(sinonChai);

const patients = [
  {
    patient_id: "123-abc",
    name: "John",
    birthDate: "1980-01-16",
    email: "john@emaik.com",
    phoneNumber: 5254125,
    status: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
];

function createDocumentClientMock() {
  const scanSpy = sinon.spy(() => ({
    promise: async () => ({
      Items: patients,
    }),
  }));

  const deleteSpy = sinon.spy(() => ({
    promise: async () => ({
      Items: [
        {
          patient_id: "123-abc",
          name: "John",
          birthDate: "1980-01-16",
          email: "john@emaik.com",
          phoneNumber: 5254125,
          status: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    }),
  }));

  const DocumentClient = class {
    constructor() {
      this.scan = scanSpy;
      this.delete = deleteSpy;
    }
  };

  return { DocumentClient, spy: { scanSpy, deleteSpy } };
}

function createHandler(mock) {
  return proxyquire("../../handler", {
    "aws-sdk": {
      DynamoDB: {
        DocumentClient: mock.DocumentClient,
        Key: {
          patient_id: "123-abc",
        },
        ConditionExpression: "attribute_exists(patient_id)",
      },
    },
  });
}

describe("API Patients", () => {
  describe("DELETE /patients/patientId", () => {
    it("should return status 204", async () => {
      const mock = createDocumentClientMock();
      const api = createHandler(mock);
      const response = await api.deletePatient({
        pathParameters: {
          patientId: "123-abc",
        },
    });
      expect(response.statusCode).to.be.equal(204);
      expect(mock.spy.deleteSpy).to.have.been.called;
    });
  });
});
