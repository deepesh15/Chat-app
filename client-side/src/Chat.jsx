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
	const [selectedPerson, setSelectedPerson] = useState(null);
	const [newMessage, setNewMessage] = useState('');
	const [messages, setMessages] = useState([]);
	const { id: loggedInUser, setId, setUserName } = useContext(UserContext);
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
			if (userId !== loggedInUser) {
				people[userId] = { userId, username };
			}
		});
		setUsersOnline(people);
	}

	function handleMessage(e) {
		const messageData = JSON.parse(e.data);
		console.log({ messageData });
		if ('online' in messageData) {
			showOnline(messageData.online);
		} else if ('message' in messageData) {
			if (messageData.sender === selectedPerson.userId) {
				setMessages((prev) => [...prev, { ...messageData }]);
			}
		}
	}

	const sendMessage = (e) => {
		if (e) e.preventDefault();
		ws.send(
			JSON.stringify({
				message: newMessage,
				sender: loggedInUser,
				recipient: selectedPerson.userId,
			}),
		);
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

		console.log('message sent');
	};

	const sendFile = (e) => {
		const reader = new FileReader();
		reader.readAsDataURL(ev.target.files[0]);
		reader.onload = () => {
			sendMessage(null, {
				name: ev.target.files[0].name,
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
		if (selectedPerson) {
			const response = fetchMessages(selectedPerson.userId);
			response.then((data) => {
				setMessages(data);
			});
		}
	}, [selectedPerson]);
	return (
		<div className='flex h-screen bg-gray-dark'>
			<div className='w-1/3'>
				<div className='flex  gap-2 items-center justify-between mx-4 text-2xl text-white px-2 py-3 '>
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
						className='rounded-lg p-2 bg-gray-dark transition-all hover:bg-blue-highlight text-white'>
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
				{Object.keys(usersOnline).map((userId) => (
					<div
						key={userId}
						onClick={() => setSelectedPerson(usersOnline[userId])}>
						<ContactCard
							{...usersOnline[userId]}
							isSelected={userId === selectedPerson?.userId}
						/>
					</div>
				))}
			</div>
			<div className='w-2/3 bg-gray-light'>
				{!selectedPerson ? (
					<DefaultChatPage />
				) : (
					<div className='flex flex-col justify-between h-screen p-2 -mt-2'>
						<Banner {...selectedPerson} />
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
												'p-2 inline-block my-2 rounded-lg ' +
												(loggedInUser === message.sender
													? 'bg-blue-highlight'
													: 'bg-gray-dark')
											}>
											<div>{message.message}</div>
										</div>
									</div>
								))}

								<div ref={divUnderMessages}></div>
							</div>
						</div>

						<form onSubmit={sendMessage} className='flex gap-2'>
							<div className='bg-white border p-2 flex-grow rounded-lg'>
								<input
									value={newMessage}
									onChange={(e) => setNewMessage(e.target.value)}
									className='bg-white '
									type='text'
									placeholder='Type your message here'
								/>
								{/* <div className={picker ? 'show' : 'text-white'}>
							<EmojiPicker onEmojiClick={emojiHandler} />
						</div> */}
							</div>
							<button
								type='submit'
								className='rounded-lg bg-gray-dark transition-all hover:bg-blue-highlight p-2 text-white'>
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
							<button className='rounded-lg bg-gray-dark transition-all hover:bg-blue-highlight p-2 text-white'>
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
										d='M12 4.5v15m7.5-7.5h-15'
									/>
								</svg>
							</button>
						</form>
					</div>
				)}
			</div>
		</div>
	);
}
