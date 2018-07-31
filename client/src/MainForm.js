import React, { Component } from 'react';
import { Dropdown, Form, Input, Button } from 'semantic-ui-react'
//import codes from './codes.json'
import dropdownOptions from './dropdownOptions.json'
// import Numberpicker from 'semantic-ui-react-numberpicker'
import Client from './Client.js'
import { DateInput } from 'semantic-ui-calendar-react'

class MainForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      origin: '', 
      destinations: [],
      options: dropdownOptions,
      destAndDays: {},
      date: '',
      result: {}
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
  }
  handleDate(e, {name, value}) {
    this.setState({
      date: value
    })
  }
  cleanDestinations() {
    var clean = {}
    var dests = this.state.destinations
    for(var i = 0; i < dests.length; i++) {
      var d = dests[i]
      var code = d[0]
      if(code in this.state.destAndDays) {
        console.log(this.state.destAndDays[code])
        clean[code] = this.state.destAndDays[code]
      }
    }
    return clean
  }
  handleSubmit(e, data) {
    e.preventDefault()
    var toSubmit = {}
    toSubmit.startingCity = this.state.origin[0]
    var cityList = this.cleanDestinations()
    toSubmit.cityList = cityList
    toSubmit.startDate = this.state.date
    console.log(toSubmit)
    Client.search(toSubmit, response => {
      this.setState({
        result: response
      });
      console.log(response);
    });
  }
  handleOrigin(e, data) {
    this.setState({
      origin: data.value
    })
  }
  handleDays(e, data, key) {
    var days = e.target.value
    var d = this.state.destAndDays
    d[key] = parseInt(days, 10)
    this.setState({
      destAndDays: d
    })
    console.log(this.state.destAndDays)
  }
  render() {
    return (
      <Form onSubmit={(e, data) => this.handleSubmit(e, data)}>
        <Form.Field name='origin'>
          <label>Origin</label>
          <Dropdown onChange={(e, data) => this.handleOrigin(e, data)} placeholder='Select Airport' options={dropdownOptions} search selection button />
        </Form.Field>
        <Form.Field>
          <label>Destinations</label>
          <Dropdown name='destinations' placeholder='Select Airports' options={dropdownOptions} multiple search selection onChange={(e, data) => this.updateDestinationState(e, data)}/>
        </Form.Field>
        {
          this.state.destinations.map((destination, index) => 
            (
              <Form.Field name='destinationDays' key={destination[0]} inline>
                <label>{destination[1]}</label>
                <Input placeholder='Days' onChange={(e, data, key) => this.handleDays(e, data, destination[0])}/>
              </Form.Field>
            )
          )
        }
        <Form.Field>
          <label>Date</label>
          <DateInput onChange={(e, data) => this.handleDate(e, data)} dateFormat={'MM-DD-YYYY'} value={this.state.date}/>
        </Form.Field>
        <Button type='submit'>Submit</Button>
      </Form> 
    )
  }
}

export default MainForm;
