// @flow
import type {CommonNamespaceState} from '$lf/common/types'
import type {MirrorOfLBStateNamespace} from '$lf/mirrorOfLBState/types'

export type StoreState = {
  common: CommonNamespaceState,
  mirrorOfLBState: MirrorOfLBStateNamespace,
}

export type Selector<ReturnType, ParamsType> = (
  state: StoreState,
  params: ParamsType,
) => ReturnType