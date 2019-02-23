import './login_page.css';

import {Button, Form, Grid, Header, Segment } from 'semantic-ui-react'

import { Redirect } from 'react-router';

import React from 'react';


class Login extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            trader_id: ""
        }
    }

    render() {
        if (this.props.trader_id == null) {
            return (
                <Grid textAlign='center' style={{height: '100%'}} verticalAlign='middle'>
                  <Grid.Column style={{maxWidth: 450}}>
                    <Header as='h2' color='blue' textAlign='center'>Login to exchange</Header>
                    <Form size='large'>
                      <Segment>
                        <Form.Input 
                          fluid 
                          icon='user'
                          iconPosition='left' 
                          placeholder='Enter login' 
                          onChange={(e) => this.setState({trader_id: e.target.value})}/>
                        <Button 
                            color='blue' 
                            fluid size='large'
                            onClick={() => {
                              if (this.state.trader_id){
                                  this.props.login(this.state.trader_id)
                              }
                            }}>
                          Login
                        </Button>
                      </Segment>
                    </Form>
                  </Grid.Column>
                </Grid>
            )
        }

        return <Redirect push to={this.props.redirect} />
    }
}


export default Login
