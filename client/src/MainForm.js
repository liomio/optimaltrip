import React, { Component } from 'react';
import { Dropdown, Form, Container, Input } from 'semantic-ui-react'
import codes from './codes.json'
import dropdownOptions from './dropdownOptions.js'
import NumberPicker from 'semantic-ui-react-numberpicker'

class MainForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      destinations: [],
      options: dropdownOptions
    }
  }
  componentDidMount() {
    console.log(this.state.options)
  }
  updateDestinationState(e, data) {
    console.log(data)
    this.setState({
      destinations: data.value
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
          this.state.destinations.map((destination, index) => 
            (
              <Form.Field key={destination[0]} inline>
                <label>{destination[1]}</label>
                <NumberPicker />
              </Form.Field>
            )
          )
        }
      </Form>

    )
  }
}

export default MainForm;
