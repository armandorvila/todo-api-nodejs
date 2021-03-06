'use strict';

const app = require('../../app');
const request = require('supertest').agent(app.listen());

const users = require('../data/users.data');
const User = require('../../models/users.model');

const tasks = require('../data/tasks.data');
const Task = require('../../models/tasks.model');

const db = require('../helpers/db.helper');

const auth = require('../helpers/auth.helper')(request);

const { expect } = require('chai');

describe('user routes', function () {

    before(function (done) {
        db.setupAll(User, users, Task, tasks, done);
    });

    after(function (done) {
        db.cleanupAll(User, Task, done);
    });

    it('should return a 200 on GET /users/:id', function (done) {
        const id = users[0]._id;
        auth.login(users[0]).then((res) => {
            request.get(`/users/${id}`).set('x-access-token', res.body.token)
                .expect(200).expect('Content-Type', /json/)
                .end((err, res) => {
                    expect(err).to.not.exist;
                    expect(res.body).have.property('email');
                    expect(res.body).have.property('firstName');
                    expect(res.body).have.property('_id');
                    expect(res.body).have.property('lastName');
                    expect(res.body).to.not.have.property('password');
                    done();
                });
        });
    });

    it('should return a 404 on GET /users/:id', function (done) {
        const id = '59943ddeca729e3398985ea7';
        auth.login(users[0]).then((res) => {
            request.get(`/users/${id}`).set('x-access-token', res.body.token)
                .expect(404).expect('Content-Type', /json/)
                .end((err, res) => {
                    expect(err).to.not.exist;
                    expect(res.body).have.property('success');
                    expect(res.body.success).to.be.equal(false);
                    done();
                });
        });
    });

    it('should return a 200 on GET /users/:id/tasks', function (done) {
        const id = '59945ddeca729e3398985ea7';
        auth.login(users[0]).then((res) => {
            request.get(`/users/${id}/tasks`).set('x-access-token', res.body.token)
                .expect(200).expect('Content-Type', /json/)
                .end((err, res) => {
                    expect(err).to.not.exist;
                    expect(res.body.length).to.be.equal(2);
                    done();
                });
        });
    });

    auth.login(users[0]).then((res) => {
        it('should return a 200 on GET /users', function (done) {
            auth.login(users[0]).then((res) => {
                request.get('/users').set('x-access-token', res.body.token)
                    .expect(200).expect('Content-Type', /json/)
                    .end((err, res) => {
                        expect(err).to.not.exist;
                        expect(res.body.length).to.be.equal(users.length);
                        expect(res.body[0]).have.property('email');
                        expect(res.body[0]).have.property('firstName');
                        expect(res.body[0]).have.property('_id');
                        expect(res.body[0]).have.property('lastName');
                        expect(res.body[0]).to.not.have.property('password');
                        done();
                    });
            });
        });


        it('should return a 202 on DELETE /users', function (done) {
            const id = users[1]._id;

            auth.login(users[0]).then((res) => {
                request.delete(`/users/${id}`).set('x-access-token', res.body.token)
                    .expect(202)
                    .end((err, res) => {
                        expect(err).to.not.exist;
                        expect(res.body).have.property('success');
                        expect(res.body.success).to.be.equal(true);
                        expect(res.body).have.property('id');
                        expect(res.body.id).to.be.equal(id);
                        done();
                    });
            });
        });

        it('should return a 201 on POST /users', function (done) {

            const user = {
                email: "_" + users[0].email,
                firstName: users[0].firstName,
                lastName: users[0].lastName,
                password: users[0].password,
            }

            auth.login(users[0]).then((res) => {
                request.post('/users').set('x-access-token', res.body.token)
                    .set('Content-Type', 'application/json')
                    .send(user)
                    .expect(201)
                    .end((err, res) => {
                        expect(err).to.not.exist;
                        expect(res.body).have.property('success');
                        expect(res.body.success).to.be.equal(true);
                        expect(res.body).have.property('id');
                        done();
                    });
            });
        });
    });
});