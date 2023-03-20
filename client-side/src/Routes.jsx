import { useContext } from 'react';
import Chat from './Chat.jsx';
import { UserContext } from './context/UserContext.jsx';
import SignUpAndLogIn from './SignUpAndLogIn';

export default function Routes() {
	const { username, id } = useContext(UserContext);

	if (username) {
		return <Chat />;
	}
	return <SignUpAndLogIn />;
}
