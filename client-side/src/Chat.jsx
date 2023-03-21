import { useContext, useEffect, useRef, useState } from 'react';
import { generateFromString } from 'generate-avatar';
import ContactCard from './components/ContactCard';
import DefaultChatPage from './components/DefaultChat';
import { UserContext } from './context/UserContext';
import axios from 'axios';
import Banner from './components/SelectedUserBanner';

export default function Chat() {
	const [ws, setWs] = useState(null);
	const [usersOnline, setUsersOnline] = useState({});
	const [usersOffline, setUsersOffline] = useState({});
	const [selectedPerson, setSelectedPerson] = useState(null);
	const [newMessage, setNewMessage] = useState('');
	const [messages, setMessages] = useState([]);
	const {
		id: loggedInUser,
		setId,
		setUserName,
		username: loggedInUserName,
	} = useContext(UserContext);
	const divUnderMessages = useRef();
	useEffect(() => {
		connectToWS();
	}, [selectedPerson]);

	function connectToWS() {
		const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);
		setWs(ws);
		ws.addEventListener('message', handleMessage);
		ws.addEventListener('close', () => {
			setTimeout(() => {
				console.log('Disconnected. Trying to connect');
				connectToWS();
			}, 5000);
		});
	}

	const logout = async () => {
		try {
			await axios.post('/logout');
			setWs(null);
			setId(null);
			setUserName(null);
		} catch (e) {
			throw e;
		}
	};

	function showOnline(peopleArray) {
		const people = {};
		peopleArray.forEach(({ userId, username }) => {
			if (userId && userId !== loggedInUser) {
				people[userId] = { userId, username };
			}
		});
		setUsersOnline(people);
	}

	function handleMessage(e) {
		const messageData = JSON.parse(e.data);
		if ('online' in messageData) {
			showOnline(messageData.online);
		} else if ('message' in messageData) {
			if (messageData.sender === selectedPerson.userId) {
				setMessages((prev) => [...prev, { ...messageData }]);
			}
		}
	}

	const sendMessage = (e, file = null) => {
		if (e) e.preventDefault();
		ws.send(
			JSON.stringify({
				message: newMessage,
				sender: loggedInUser,
				recipient: selectedPerson.userId,
				file,
			}),
		);
		if (file) {
			axios.get('/messages/' + selectedPerson.userId).then((res) => {
				setMessages(res.data);
			});
		} else {
			setNewMessage('');
			setMessages((prev) => [
				...prev,
				{
					message: newMessage,
					sender: loggedInUser,
					recipient: selectedPerson.userId,
					_id: Date.now(),
				},
			]);
		}
	};

	const sendFile = (e) => {
		const reader = new FileReader();
		reader.readAsDataURL(e.target.files[0]);
		reader.onload = () => {
			sendMessage(null, {
				name: e.target.files[0].name,
				data: reader.result,
			});
		};
	};

	const fetchMessages = async (userId) => {
		try {
			const res = await axios.get(`/messages/${userId}`);
			return res.data;
		} catch (error) {
			throw error;
		}
	};

	useEffect(() => {
		const div = divUnderMessages.current;
		if (div) div.scrollIntoView({ behavior: 'smooth', block: 'end' });
	}, [messages]);

	useEffect(() => {
		axios.get('/people').then((res) => {
			const offlineUsersArr = res.data
				.filter((p) => p._id !== loggedInUser)
				.filter((p) => !Object.keys(usersOnline).includes(p._id));
			const offlineUsers = {};
			offlineUsersArr.forEach((p) => {
				offlineUsers[p._id] = { userId: p._id, username: p.username };
			});
			setUsersOffline(offlineUsers);
		});
	}, [usersOnline]);

	useEffect(() => {
		if (selectedPerson) {
			const response = fetchMessages(selectedPerson.userId);
			response.then((data) => {
				setMessages(data);
			});
		}
	}, [selectedPerson]);
	return (
		<div className='flex h-screen bg-background-contact'>
			<div className='w-1/3 p-4'>
				<div className='flex gap-2 items-center justify-between mx-4 text-2xl text-white py-2 '>
					<div className='flex gap-2 items-center'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='w-6 h-6'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155'
							/>
						</svg>

						<h3>Chat-app</h3>
					</div>
					<button
						onClick={logout}
						className='rounded-lg p-2 bg-background-contact transition-all  hover:bg-highlight hover:text-background'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='w-6 h-6'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75'
							/>
						</svg>
					</button>
				</div>
				<div className='text-white bg-message-user rounded-lg mb-2 shadow-xl'>
					<div className='flex p-2 items-center gap-2 '>
						<div className='flex relative items-center rounded-full '>
							<img
								className='rounded-full w-10 h-10'
								src={`data:image/svg+xml;utf8,${generateFromString(
									loggedInUser,
								)}`}
								alt=''
							/>
						</div>
						<div className='text-2xl font-bold'>{loggedInUserName}</div>
					</div>
				</div>

				<div className='text-white'>
					{Object.keys(usersOnline).map((userId) => (
						<div
							key={userId}
							onClick={() => setSelectedPerson(usersOnline[userId])}>
							<ContactCard
								id={userId}
								name={usersOnline[userId].username}
								isSelected={userId === selectedPerson?.userId}
								isOnline={true}
							/>
						</div>
					))}
					{Object.keys(usersOffline).map((userId) => (
						<div
							key={userId}
							onClick={() => setSelectedPerson(usersOffline[userId])}>
							<ContactCard
								id={userId}
								name={usersOffline[userId].username}
								isSelected={userId === selectedPerson?.userId}
								isOnline={false}
							/>
						</div>
					))}
				</div>
			</div>
			<div className='w-2/3 bg-gray-light p-4'>
				{!selectedPerson ? (
					<DefaultChatPage />
				) : (
					<div className='flex flex-col justify-between h-screen p-2 -mt-2'>
						<Banner
							userId={selectedPerson?.userId}
							username={selectedPerson.username}
						/>
						<div className='relative h-full'>
							<div className='overflow-y-scroll absolute top-0 left-0 right-0 bottom-2 text-white '>
								{messages.map((message) => (
									<div
										key={message._id}
										className={
											loggedInUser === message.sender
												? 'text-right'
												: 'text-left'
										}>
										<div
											className={
												'p-2 inline-block my-2 rounded-lg shadow-xl ' +
												(loggedInUser === message.sender
													? 'bg-message-user'
													: 'bg-background')
											}>
											<div>{message.message}</div>
											{message.file && (
												<div className=''>
													<a
														target='_blank'
														className='flex items-center gap-1 border-b'
														href={
															axios.defaults.baseURL +
															'/uploads/' +
															message.file
														}>
														<svg
															xmlns='http://www.w3.org/2000/svg'
															viewBox='0 0 24 24'
															fill='currentColor'
															className='w-4 h-4'>
															<path
																fillRule='evenodd'
																d='M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z'
																clipRule='evenodd'
															/>
														</svg>
														{message.file}
													</a>
												</div>
											)}
										</div>
									</div>
								))}

								<div ref={divUnderMessages}></div>
							</div>
						</div>
						<div className='bg-background rounded-lg p-2'>
							<form onSubmit={sendMessage} className='flex gap-2'>
								<div className='  p-2 flex-grow rounded-lg'>
									<input
										value={newMessage}
										onChange={(e) => setNewMessage(e.target.value)}
										className='bg-background'
										type='text'
										placeholder='Type your message here'
									/>
									{/* <div className={picker ? 'show' : 'text-white'}>
							<EmojiPicker onEmojiClick={emojiHandler} />
						</div> */}
								</div>
								<button className='rounded-lg transition-all  p-2 text-white hover:bg-highlight hover:text-background'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
										strokeWidth={1.5}
										stroke='currentColor'
										className='w-6 h-6'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											d='M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z'
										/>
									</svg>
								</button>
								<button
									type='submit'
									className='rounded-lg transition-all  p-2 text-white hover:bg-highlight hover:text-background'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
										strokeWidth={1.5}
										stroke='currentColor'
										className='w-6 h-6'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											d='M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5'
										/>
									</svg>
								</button>
								<label
									type='button'
									className='rounded-lg transition-all  p-2 text-white hover:bg-highlight hover:text-background'>
									<input type='file' className='hidden' onChange={sendFile} />
									<svg
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
										strokeWidth={1.5}
										stroke='currentColor'
										className='w-6 h-6'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											d='M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13'
										/>
									</svg>
								</label>
							</form>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
