const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const controller = require('./book.controller');
const model = require('../models').book;
const transaction = require('../models').transaction;

describe('Books controller', () => {
  describe('When getting a list of books', () => {
    it('Should return 4 books', () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      sinon.stub(model, 'all').resolves([{}, {}, {}, {}]);
      return controller.list(req, res).then(() => {
        return expect(res._getData().length).to.eql(4);
      });
    });
  });

  describe('When creating a book', () => {
    it('Should add the book to the database', () => {
      const book = {
        title: 'Test Book',
        author: 'John Q Public',
        publicationDate: '2018-01-01',
        isbn: '1234567890'
      };
      const req = httpMocks.createRequest({
        body: book
      });

      const res = httpMocks.createResponse();

      sinon.spy(model, 'create');

      return controller.create(req, res).then(() => {
        return expect(model.create.called).to.be.true;
      });
    });
  });

  describe('When getting a specific book', () => {
    afterEach(() => {
      model.findById.restore && model.findById.restore();
    });
    describe('and the book does not exist', () => {
      it('Should return a 404', () => {
        const req = httpMocks.createRequest({
          params: {
            id: 7
          }
        });

        const res = httpMocks.createResponse();

        const find = sinon.stub(model, 'findById');
        find.withArgs(7).resolves(null);

        return controller.getById(req, res).then(() => {
          return expect(res.statusCode).to.eql(404);
        });
      });
    });

    describe('and the book does exist', () => {
      it('should return 200', () => {
        const req = httpMocks.createRequest({
          params: {
            id: 7
          }
        });

        const res = httpMocks.createResponse();

        const find = sinon.stub(model, 'findById');
        find.resolves({});

        return controller.getById(req, res).then(() => {
          return expect(res.statusCode).to.eql(200);
        });
      });
    });
  });

  describe('When purchasing a book', () => {
    it('Should add a transaction', () => {
      const req = httpMocks.createRequest({
        body: {
          amount: 10.97,
          user_id: 23
        },
        params: {
          id: 1
        }
      });

      const res = httpMocks.createResponse();

      const tx = sinon.mock(transaction);
      tx.expects('create')
        .once()
        .withArgs({ id: 1, user_id: 23, amount: 10.97 })
        .resolves({});

      return controller.purchase(req, res).then(() => {
        tx.verify();
      });
    });
  });
});
