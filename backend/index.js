const express = require('express');
const cors = require('cors');
const ws = require('ws');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { default: mongoose } = require('mongoose');

const User = require('./models/User');
const Message = require('./models/Message');
const { MONGODB_URL, JWT_SECRET, CLIENT_URL } = require('./config');

mongoose.connect(MONGODB_URL);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		credentials: true,
		origin: CLIENT_URL,
	}),
);
app.use('/uploads', express.static(__dirname + '/uploads'));
const getUserDataFromToken = async (req) => {
	return new Promise((resolve, reject) => {
		const token = req.cookies?.token;
		if (token) {
			jwt.verify(token, JWT_SECRET, {}, (err, userData) => {
				if (err) throw err;
				resolve(userData);
			});
		} else {
			reject('No Token');
		}
	});
};

app.get('/', (req, res) => {
	res.json('test ok');
});

app.get('/profile', (req, res) => {
	const token = req.cookies?.token;
	if (token) {
		jwt.verify(token, JWT_SECRET, {}, (err, userData) => {
			if (err) throw err;
			res.json(userData);
		});
	} else {
		res.status(401).json('no token');
	}
});

app.post('/register', async (req, res) => {
	const { username, password } = req.body;

	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const createdUser = await User.create({
			username,
			password: hashedPassword,
		});
		jwt.sign(
			{ userId: createdUser._id, username },
			JWT_SECRET,
			{},
			(err, token) => {
				if (err) throw err;
				else {
					res
						.cookie('token', token, {
							sameSite: 'none',
							secure: true,
						})
						.status(201)
						.json({
							id: createdUser._id,
						});
				}
			},
		);
	} catch (error) {
		throw error;
	}
});

app.post('/login', async (req, res) => {
	const { username, password } = req.body;
	const foundUser = await User.findOne({ username });
	if (foundUser && bcrypt.compareSync(password, foundUser.password)) {
		jwt.sign(
			{ userId: foundUser._id, username },
			JWT_SECRET,
			{},
			(err, token) => {
				res
					.cookie('token', token, {
						sameSite: 'none',
						secure: true,
					})
					.json({ id: foundUser._id });
			},
		);
	}
});

app.post('/logout', (req, res) => {
	res.cookie('token', '', { sameSite: 'none', secure: true }).json('ok');
});

app.get('/messages/:userId', async (req, res) => {
	const { userId } = req.params;
	const { userId: loggedInUser } = await getUserDataFromToken(req);

	try {
		const messages = await Message.find({
			sender: { $in: [userId, loggedInUser] },
			recipient: { $in: [userId, loggedInUser] },
		}).sort({ createdAt: 1 });
		res.json(messages);
	} catch (error) {
		throw error;
	}
});

app.get('/people', async (req, res) => {
	try {
		const users = await User.find({}, { _id: 1, username: 1 });
		res.json(users);
	} catch (error) {
		throw error;
	}
});

const server = app.listen(4000);

const wss = new ws.WebSocketServer({ server });

wss.on('connection', (connection, req) => {
	// notify everyone about online people (when someone connects)
	function notifyAboutOnlinePeople() {
		[...wss.clients].forEach((client) => {
			client.send(
				JSON.stringify({
					online: [...wss.clients].map((c) => ({
						userId: c.userId,
						username: c.username,
					})),
				}),
			);
		});
	}

	// ping
	connection.isAlive = true;

	connection.timer = setInterval(() => {
		connection.ping();
		connection.deathTimer = setTimeout(() => {
			connection.isAlive = false;
			clearInterval(connection.timer);
			connection.terminate();
			notifyAboutOnlinePeople();
			console.log('dead');
		}, 1000);
	}, 5000);

	connection.on('pong', () => {
		clearTimeout(connection.deathTimer);
	});

	// get username and id from the cookie
	const cookies = req.headers?.cookie;
	if (cookies) {
		const tokenCookieString = cookies
			.split(';')
			.find((str) => str.startsWith('token='));
		if (tokenCookieString) {
			const token = tokenCookieString.split('=')[1];
			if (token) {
				jwt.verify(token, JWT_SECRET, {}, (err, userData) => {
					if (err) throw err;
					const { userId, username } = userData;
					connection.userId = userId;
					connection.username = username;
				});
			}
		}
	}

	connection.on('message', async (data) => {
		const { recipient, message, sender, file } = JSON.parse(data);
		let filename = null;
		if (file) {
			console.log('size', file.data.length);
			const parts = file.name.split('.');
			filename = Date.now() + '.' + parts.slice(-1);
			const path = __dirname + '/uploads/' + filename;
			const bufferData = Buffer.from(file.data.split(',')[1], 'base64');
			fs.writeFile(path, bufferData, () => {
				console.log('file saved:' + path);
			});
		}
		if (recipient && (message || file)) {
			const messageDoc = await Message.create({
				sender,
				recipient,
				message,
				file: file ? filename : null,
			});
			console.log('created message');
			[...wss.clients]
				.filter((client) => client.userId === recipient)
				.forEach((client) =>
					client.send(
						JSON.stringify({
							sender,
							recipient,
							message,
							messageId: messageDoc._id,
							file: file ? filename : null,
						}),
					),
				);
		}
	});

	notifyAboutOnlinePeople();
});
