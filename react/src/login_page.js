import React from 'react';
import { Redirect } from 'react-router';
import './login_page.css';

class Login extends React.Component {
    constructor(props)
    {
        super(props)
        this.state = {
            redirect: false
        }
    }

    render() {
        if (this.state.redirect) {
            return <Redirect push to="/TraderInterface" />
        }

        return (
                <div className="login-page">
                    <b>Username</b>
                    <input type="text"></input>
                    <b>Password</b>
                    <input type="text"></input>
                    <button className="login-button" onClick={() => this.handleOnClick()}>Login</button>
                </div>
               );
    }

    handleOnClick()
    {
        console.log("Logging in redirecting")
        this.setState({redirect: true})
    }
}

export default Login
