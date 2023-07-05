const mysql = require('mysql');

var connection = mysql.createConnection({
	host : 'localhost',
	database : 'nodelogin',
	user : 'root',
	password : 'freefrag'
});

connection.connect(function(error){
	if(error)
	{
		throw error;
	}
	else
	{
		console.log('MySQL Database is connected Successfully');
	}
});

module.exports = connection;