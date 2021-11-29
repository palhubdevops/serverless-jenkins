const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

const proxyquire = require("proxyquire").noCallThru();
const { expect } = chai;

chai.should();
chai.use(sinonChai);

const patients = [{ id: 2, name: "John", birthDate: "1980-01-16" }];

function createDocumentClientMock() {
  const scanSpy = sinon.spy(() => ({
    promise: async () => ({
      Items: patients,
    }),
  }));

  const getSpy = sinon.spy(() => ({
    promise: async () => ({
      Items: [{ id: 2, name: "John", birthDate: "1980-01-16" }],
    }),
  }));

  const DocumentClient = class {
    constructor() {
      this.scan = scanSpy;
      this.get = getSpy;
    }
  };

  return { DocumentClient, spy: { scanSpy } };
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
  describe("GET /patients/patientId", () => {
    it("should return patient by id", async () => {
      const mock = createDocumentClientMock();
      const api = createHandler(mock);
      const response = await api.getPacient({
        event: {
          pathParameters: {
            patientId: "123-abc",
          },
        },
      });
      expect(response.statusCode).to.be.equal(200);
      expect(mock.spy.scanSpy).to.have.been.called;
    });
  });
});
