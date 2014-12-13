import os
import sys
import pymongo
import bson
from flask import Flask, request, session, g, redirect, url_for, \
    abort, render_template, flash, jsonify

SECRET_KEY = 'development_key'

app = Flask(__name__)
app.config.from_object(__name__)

# routes concerned with login/logout namespaced to '/auth'
@app.route('/auth/login', methods=['POST'])
def login():
    '''Accept user info, check against database, log user
    in if credentials are good, and send the user document.'''
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
            # return username to be stored in localStorage
            return jsonify({"user":user['name'], "contacts":user['contacts'],
                "tags":user['tags']})
    else:
        # if credentials don't match, return message with 401 status
        return jsonify(message="Incorrect username or password"), 401

@app.route('/auth/logout', methods=['GET'])
def logout():
    '''Log the user out.'''
    session.pop('logged_in', None)
    return jsonify(message="You were logged out")

# all xhr routes concerning data namespaced to '/api'
@app.route('/api/users', methods=['POST'])
def create_user():
    '''Create a new user: add username/password to database, if the
    username is already taken, return 422. If write is successful,
    return 201.'''
    content = request.get_json()
    username = content['username']
    password = content['password']
    # note: for this to work there must be a unique index on "name"
    # run `db.users.ensureIndex({name: 1}, {unique: true})` in mongo
    try:
        db.users.insert({"name":username, "password":password, "contacts":[],
            "tags":[]})
    except pymongo.errors.DuplicateKeyError:
        return jsonify(message="Username already in use"), 422
    except:
        return jsonify(message="Database connection problem"), 500

    return jsonify(message="You have successfully registered"), 201

# get contacts by user
@app.route('/api/users/<username>/contacts', methods=['GET'])
def get_user_contacts(username):
    '''Get contacts by user: if user is logged in, return contacts
    array.'''
    if (not session.get('logged_in') or
        not username == session.get('username')):
        abort(401)
    try:
        user = db.users.find_one({"name":username}, {"_id":0})
    except:
        return jsonify(message="Database connection problem"), 500

    if user != None:
        return jsonify({"contacts":user["contacts"]})
    else:
        return jsonify(message="User not found"), 401

# create new contact
@app.route('/api/users/<username>/contacts', methods=['POST'])
def create_contact(username):
    '''Create new contact: if user is logged in, get contents of json
    document and insert into contacts array.'''
    if (not session.get('logged_in') or
        not username == session.get('username')):
        abort(401)
    # get post request content (new contact object)
    content = request.get_json()
    # assign unique (not guaranteed) object id and convert to string
    content['id'] = str(bson.objectid.ObjectId())
    # push to contacts array
    try:
        db.users.update({"name":username},{"$push":{"contacts": content}})
    except:
        return jsonify(message="Database connection problem"), 500

    return jsonify(message="Contact has been successfully added",
        contact=content), 201

# update contact
@app.route('/api/users/<username>/contacts/<id>', methods=['PUT'])
def update_contact(username, id):
    '''Update contact: if user is logged in, get json document and
    reset contact object by id.'''
    if (not session.get('logged_in') or
        not username == session.get('username')):
        abort(401)
    # get post request content (updated contact object)
    content = request.get_json()
    # update item <id> in contacts array
    try:
        db.users.update({"name":username, "contacts.id":id},
            {"$set":{"contacts.$":content}})
    except:
        return jsonify(message="Database connection problem"), 500

    return jsonify(message="Contact has been successfully updated",
        contact=content)

# remove contact
@app.route('/api/users/<username>/contacts/<id>', methods=['DELETE'])
def delete_contact(username, id):
    '''Remove contact: if user is logged in, remove contact object by
    by id.'''
    if (not session.get('logged_in') or
        not username == session.get('username')):
        abort(401)
    # remove contact by id
    try:
        db.users.update({"name":username}, {"$pull":{"contacts":{"id":id}}})
    except:
        return jsonify(message="Database connection problem"), 500

    return jsonify(message="Contact has been successfully deleted")

# get tags by user
@app.route('/api/users/<username>/tags', methods=['GET'])
def get_user_tags(username):
    '''Get tags by user: if user is logged in, return tags array.'''
    if (not session.get('logged_in') or
        not username == session.get('username')):
        abort(401)
    try:
        user = db.users.find_one({"name":username}, {"_id":0})
    except:
        return jsonify(message="Database connection problem"), 500

    if user != None:
        return jsonify({"tags":user['tags']})
    else:
        return jsonify(message="User not found"), 401

# create new tag
@app.route('/api/users/<username>/tags', methods=['POST'])
def create_tag(username):
    '''Create tag: if user is logged in, push post content to tags
    array.'''
    if (not session.get('logged_in') or
        not username == session.get('username')):
        abort(401)
    # get post request content
    content = request.get_json()
    # push to tags array
    try:
        db.users.update({"name":username},{'$push':{'tags': content}})
    except:
        return jsonify(message="Database connection problem"), 500

    return jsonify(message="Tag has been successfully added"), 201

# serve the Angular app
# every route to be handled by Angular needs to be added here 
# or else Flask will throw 404 if that route hits the server
@app.route('/')
@app.route('/login')
@app.route('/register')
@app.route('/add')
@app.route('/contact/<arg>')
@app.route('/contact/<arg>/update')
# @app.route('/tags/<arg>')
def serve_app(arg=''):
    '''Serve app: render the index.html template and send.'''
    return render_template('index.html')

# connect to database 'test' and assign handle 'db'
connection = pymongo.MongoClient('localhost', 27017)
db = connection.contacts_app

if __name__ == '__main__':
    app.run(debug=True)