import { useContext, useState } from 'react';
import axios from 'axios';
import { UserContext } from './context/UserContext.jsx';

export default function Register() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [isLoginOrRegister, setLoginOrRegister] = useState('login');
	const { setUserName, setId } = useContext(UserContext);

	async function handleSubmit(ev) {
		ev.preventDefault();
		const url = isLoginOrRegister === 'register' ? '/register' : '/login';
		try {
			const { data } = await axios.post(url, {
				username,
				password,
			});
			setUserName(username);
			setId(data.id);
		} catch (error) {
			throw error;
		}
	}

	return (
		<div className='bg-gray-dark  h-screen flex items-center'>
			<form className='w-64 mx-auto mb-12' onSubmit={handleSubmit} action=''>
				<input
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					type='text'
					placeholder='username'
					className='block w-full rounded-md p-2 mb-2 border'
				/>
				<input
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type='password'
					placeholder='password'
					className='block w-full rounded-md p-2 mb-2 border'
				/>
				<button className='block w-full rounded-md p-2 bg-gray-light text-white hover:bg-blue-highlight transition-all'>
					{isLoginOrRegister === 'register' ? 'Register' : 'Login'}
				</button>
				<div className='text-white text-center mt-2'>
					{isLoginOrRegister === 'register' ? (
						<div>
							Already a member ?{' '}
							<button
								onClick={() => setLoginOrRegister('login')}
								className='hover:text-blue-highlight hover:underline'>
								Log in
							</button>
						</div>
					) : (
						<div>
							Don't have a account ?{' '}
							<button
								onClick={() => setLoginOrRegister('register')}
								className='hover:text-blue-highlight hover:underline'>
								Sign up
							</button>
						</div>
					)}
				</div>
			</form>
		</div>
	);
}
