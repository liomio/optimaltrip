import React, { Component } from 'react';
import { Dropdown, Form, Container, Input } from 'semantic-ui-react'
import codes from './codes.json'
import dropdownOptions from './dropdownOptions.json'
// import Numberpicker from 'semantic-ui-react-numberpicker'

class MainForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            destinations: []
        }
    }
    componentDidMount() {
        console.log(codes);
    }
    updateDestinationState(e, data) {
        this.setState({
            destinations: data['value']
        })
        console.log(this.state.destinations)
    }
    render() {
        return (
            <Form>
                <Form.Field>
                    <label>Origin</label>
                    <Dropdown placeholder='Select Airport' options={dropdownOptions} search selection button />
                </Form.Field>
                <Form.Field>
                    <label>Destinations</label>
                    <Dropdown placeholder='Select Airports' options={dropdownOptions} multiple search selection onChange={(e, data) => this.updateDestinationState(e, data)}/>
                </Form.Field>
                {
                    this.state.destinations.map(destination => 
                        (
                            <Form.Field fluid='true' key={destination} inline>
                                <label>{destination['name']}</label>
                                <Input placeholder='Days' />
                            </Form.Field>
                        )
                    )
                }
            </Form>

        )
        }
}

export default MainForm;
