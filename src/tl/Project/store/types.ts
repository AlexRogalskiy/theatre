import * as t from '$shared/ioTypes'
import {$StateWithHistory} from '$shared/utils/redux/withHistory/withHistory'

/**
 * Ahistoric state is persisted, but its changes
 * are not undoable.
 */
export const $ProjectAhistoricState = t.type({})

export type ProjectAhistoricState = t.StaticTypeOf<
  typeof $ProjectAhistoricState
>

/**
 * Ephemeral state is neither persisted nor undoable
 */
export const $ProjectEphemeralState = t.type({})

export type ProjectEphemeralState = t.StaticTypeOf<
  typeof $ProjectEphemeralState
>

const $PrimitiveValue = t.type(
  {type: t.literal('PrimitiveValue'), stringRepresentation: t.string},
  'PrimitiveValue',
)

const $StaticValueContainer = t.type({
  type: t.literal('StaticValueContainer'),
  value: $PrimitiveValue,
})

const $PropValueContainer = t.taggedUnion('type', [$StaticValueContainer])

const $ObjectPropState = t.type(
  {
    valueContainer: $PropValueContainer,
  },
  'ObjectPropState',
)

const $InternalObjectState = t.type(
  {
    props: t.record(t.string, $ObjectPropState),
  },
  'InternalObjectState',
)

const $InternalTimelineState = t.type(
  {
    objects: t.record(t.string, $InternalObjectState),
  },
  'InternalTimelineState',
)

/**
 * Historic state is both persisted and is undoable
 */
export const $ProjectHistoricState = t.type({
  internalTimeines: t.record(t.string, $InternalTimelineState),
})

export type ProjectHistoricState = t.StaticTypeOf<typeof $ProjectHistoricState>

export const $ProjectState = t.type({
  historic: $StateWithHistory($ProjectHistoricState),
  ahistoric: $ProjectAhistoricState,
  ephemeral: $ProjectEphemeralState,
})

export type ProjectState = t.StaticTypeOf<typeof $ProjectState>