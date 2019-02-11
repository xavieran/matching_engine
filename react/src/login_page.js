import './login_page.css';

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import { Redirect } from 'react-router';

import React from 'react';


class Login extends React.Component {
    render() {
        console.log("id", this.props.trader_id)
        if (this.props.trader_id == null) {
            return (
                <Form>
                  <Form.Group controlId="formLogin">
                    <Form.Control size="lg" type="text" placeholder="Enter username" ref={(ref) => this.trader_id = ref}/>
                    <Button size="lg" variant="primary" type="submit" onClick={() => this.props.login(this.trader_id.value)}>Login</Button>
                  </Form.Group>
                </Form>
            )
        }

        return <Redirect push to="/TraderInterface" />
    }
}

export default Login
