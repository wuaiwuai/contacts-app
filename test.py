import os
import sys
import pymongo

connection = pymongo.MongoClient('localhost', 27017)
db = connection.test

def dup_key_test():
    username = "admin"
    password = "password"

    try:
        db.users.insert({"name":username, "password":password})
    except pymongo.errors.DuplicateKeyError:
        print "Duplicate key error"
        print "Unexpected error:", sys.exc_info()[0]
    except:
        print "Unexpected server error"
        print "Unexpected error:", sys.exc_info()[0]

def insert_test():
    content = dict()
    content['firstName'] = 'John'
    content['lastName'] = 'Willard'
    content['company'] = ''
    content['phone'] = '703.795.3617'
    content['address'] = '6421 Washington Blvd'
    content['birthday'] = '11/18/1986'
    content['email'] = 'jgwil2@gmail.com'
    content['notes'] = 'Cool dude'

    try:
        db.users.update({'name':'admin'},{
            '$push': {'contacts' : content}
            })
    except:
        print "Unexpected server error"
        print "Unexpected error:", sys.exc_info()[0]
