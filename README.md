Contacts-app
============

Project Overview
----------------

Simple web application for gathering and editing a user's contacts.

Requirements
------------

- User account
- Create contact
- Delete contact
- Edit contacts
- Contact fields should include
  - first name
  - last name
  - company name
  - phone
  - address
  - birthday
  - additional notes
- Search contact list
- Contact grouping/sorting via tagging/labels

Phase 2 Features
----------------

- Port project over to OSX, iOS, and Android as a native app
- Sync contacts

To run
------

- Mongod must be running on port 27017
- To get sample data, run:
    `mongorestore dump`
- Open mongo shell (`mongo`) and add unique index:
    `db.users.ensureIndex({name: 1}, {unique: true})`
- Python 2.7, virtualenv, pip
- Create virtualenv:
    `virtualenv venv`
- Activate virtualenv:
    `source venv/bin/activate`
- Install requirements:
    `pip install -r requirements.txt`
- Run app on port 5000:
    `python app.py`

Proposed Schema
---------------

    {
    	"name": "",
    	"password": "",
    	"contacts":
    		[
    			{
    				"lastName": "",
    				"firstName": "",
    				"company": "",
    				"phone": "",
    				"address": "",
    				"birthday": "",
    				"notes": "",
    				"tags" : []
    			}
    		]
    }
