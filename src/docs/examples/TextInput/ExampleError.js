import React from 'react';
import TextInput from 'ps-react/TextInput';

/** Required TextBox */
export default class ExampleError extends React.Component {
    render() {
        return (
            <TextInput
                htmlId="example-optional"
                label="First Name"
                name="firstname"
                onChange={() => {}}
                required
                error="First name is required."
            />
        )
    }
}