import Studio from './Studio'
import MirrorOfReactTree, {
  VolatileId,
  State as MState,
} from '$studio/integrations/react/treeMirroring/MirrorOfReactTree'
import atom, {Atom} from '$shared/DataVerse2/atom'
import {omit} from 'lodash'

type State = {
  unexpandedViewports: Record<string, VolatileId>
  expandedViewports: Record<string, VolatileId>
}

export default class ElementTree {
  mirrorOfReactTreeAtom: Atom<MState>
  atom: Atom<State>
  mirrorOfReactTree: MirrorOfReactTree
  constructor(readonly _studio: Studio) {
    this.mirrorOfReactTree = new MirrorOfReactTree()
    this.atom = atom({
      unexpandedViewports: {},
      expandedViewports: {},
    })
    this.mirrorOfReactTreeAtom = atom(this.mirrorOfReactTree.getState())
  }

  tick() {
    const oldS = this.mirrorOfReactTreeAtom.getState()
    const newS = this.mirrorOfReactTree.getState()
    if (oldS !== newS) {
      this.mirrorOfReactTreeAtom.setState(newS)
    }
  }

  registerUnexpandedViewport(
    viewportId: string,
    elementVolatileId: VolatileId,
  ) {
    this.atom.reduceState(
      ['unexpandedViewports', viewportId],
      () => elementVolatileId,
    )
  }

  unregisterUnexpandedViewport(viewportId: string) {
    this.atom.reduceState(['unexpandedViewports'], unexpandedViewports =>
      omit(unexpandedViewports, viewportId),
    )
  }
}