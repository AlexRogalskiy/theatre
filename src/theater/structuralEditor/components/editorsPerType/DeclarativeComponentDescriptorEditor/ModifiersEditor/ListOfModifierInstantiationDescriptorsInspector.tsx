import React from 'react'
import connect from '$theater/handy/connect'
import {IModifierInstantiationValueDescriptors} from '$theater/componentModel/types'
import ModifierInstantiationDescriptorInspector from './ModifierInstantiationDescriptorInspector'
import get from 'lodash/get'
import {ITheaterStoreState} from '$theater/types'

interface IOwnProps {
  modifierInstantiationDescriptors: IModifierInstantiationValueDescriptors
  pathToModifierInstantiationDescriptors: string[]
}

interface IProps extends IOwnProps {
  listOfModifierInstantiationDescriptors: string[]
}

type State = {}

export class ListOfModifierInstantiationDescriptorsInspector extends React.PureComponent<
  IProps,
  State
> {
  constructor(props: IProps) {
    super(props)
    this.state = {}
  }

  render() {
    const {pathToModifierInstantiationDescriptors} = this.props
    return this.props.listOfModifierInstantiationDescriptors.map(
      (id: string, index: number) => {
        const modifierInstantiationDescriptor = this.props
          .modifierInstantiationDescriptors.byId[id]
        return (
          <ModifierInstantiationDescriptorInspector
            pathToModifierInstantiationDescriptor={[
              ...pathToModifierInstantiationDescriptors,
              'byId',
              id,
            ]}
            key={id}
            id={id}
            index={index}
            modifierInstantiationDescriptor={modifierInstantiationDescriptor}
          />
        )
      },
    )
  }
}

export default connect((s: ITheaterStoreState, op: IOwnProps) => {
  return {
    listOfModifierInstantiationDescriptors: get(s, [
      ...op.pathToModifierInstantiationDescriptors,
      'list',
    ]),
  }
})(ListOfModifierInstantiationDescriptorsInspector)