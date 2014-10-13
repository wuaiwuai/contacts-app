import os
import sys
import pymongo
from flask import Flask, request, session, g, redirect, url_for, \
    abort, render_template, flash, jsonify

SECRET_KEY = 'development_key'

app = Flask(__name__)
app.config.from_object(__name__)

# routes concerned with login/logout namespaced to '/auth'
@app.route('/auth/login', methods=['POST'])
def login():
    # expect json request content
    content = request.get_json()
    username = content['username']
    password = content['password']
    # find by username, suppress _id field, catch exceptions
    try:
        user = db.users.find_one({"name":username}, {"_id":0})
    except:
        return jsonify(message="Database connection problem"), 500

    if user != None and user['password'] == password:
            session['logged_in'] = True
            session['username'] = username
            return jsonify(user)
    else:
        # if credentials don't match, return message with 401 status
        return jsonify(message="Incorrect username or password"), 401

@app.route('/auth/logout', methods=['GET'])
def logout():
    session.pop('logged_in', None)
    return jsonify(message="You were logged out")

# all xhr routes concerning data namespaced to '/api'
@app.route('/api/users', methods=['POST'])
def create_user():
    content = request.get_json()
    username = content['username']
    password = content['password']

    try:
        user = db.users.find_one({"name":username}, {"_id":0})
    except:
        return jsonify(message="Database connection problem"), 500

    if user != None:
        return jsonify(message="Username already in use"), 422
    else:
        new_user = {"name":username, "password":password}
        try:
            db.users.insert(new_user)
        except:
            return jsonify(message="Database connection problem"), 500

        return jsonify(message="You have successfully registered"), 201

# serve the Angular app
# every route to be handled by Angular needs to be added here 
# or else Flask will throw 404 if that route hits the server
@app.route('/')
@app.route('/login')
@app.route('/register')
def index():
    return render_template('index.html')

# connect to database 'test' and assign handle 'db'
connection = pymongo.MongoClient('localhost', 27017)
db = connection.test

if __name__ == '__main__':
    app.run(debug=True)