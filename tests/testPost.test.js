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

  const putSpy = sinon.spy(() => ({
    promise: async () => ({
      Items: [
        {
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
      this.put = putSpy;
    }
  };

  return { DocumentClient, spy: { scanSpy, putSpy } };
}

function createHandler(mock) {
  return proxyquire("../../handler", {
    "aws-sdk": {
      DynamoDB: {
        DocumentClient: mock.DocumentClient,
      },
    },
  });
}

describe("API Patients", () => {
  describe("POST /patients", () => {
    it("should return status 201", async () => {
      const mock = createDocumentClientMock();
      const api = createHandler(mock);
      const response = await api.postPatient({
        body: JSON.stringify({
          name: "John",
          birthDate: "1980-01-16",
          email: "john@emaik.com",
          phoneNumber: 5254125,
          status: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        }),
      });
      expect(response.statusCode).to.be.equal(201);
      expect(mock.spy.putSpy).to.have.been.called;
    });
  });
});
