import AbstractDerivation from './AbstractDerivation'

const UPDATE_NEEDED_FROM = {
  none: 0,
  dep: 1,
  inner: 2,
}

export class FlatMapDerivation<V, DepType, FnType extends (v: DepType) => AbstractDerivation<V>> extends AbstractDerivation<V> {
  _innerDerivation: undefined | null | AbstractDerivation<V>
  _updateNeededFrom: (typeof UPDATE_NEEDED_FROM)[keyof typeof UPDATE_NEEDED_FROM]
  _hot: boolean

  static displayName = 'flatMap'

  constructor(
    readonly _depDerivation: AbstractDerivation<DepType>,
    readonly _fn: FnType,
  ) {
    super()
    this._innerDerivation = undefined
    this._updateNeededFrom = UPDATE_NEEDED_FROM.dep
    this._hot = false

    this._addDependency(_depDerivation)

    return this
  }

  _recalculateHot() {
    const updateNeededFrom = this._updateNeededFrom
    this._updateNeededFrom = UPDATE_NEEDED_FROM.none

    if (updateNeededFrom === UPDATE_NEEDED_FROM.inner) {
      // @ts-ignore
      return this._innerDerivation.getValue()
    }

    const possibleInnerDerivation = this._fn(this._depDerivation.getValue())

    if (possibleInnerDerivation instanceof AbstractDerivation) {
      this._innerDerivation = possibleInnerDerivation
      this._addDependency(possibleInnerDerivation)
      return possibleInnerDerivation.getValue()
    } else {
      return possibleInnerDerivation
    }
  }

  _recalculateCold() {
    const possibleInnerDerivation = this._fn(this._depDerivation.getValue())

    if (possibleInnerDerivation instanceof AbstractDerivation) {
      return possibleInnerDerivation.getValue()
    } else {
      return possibleInnerDerivation
    }
  }

  _recalculate() {
    return this._hot ? this._recalculateHot() : this._recalculateCold()
  }

  _youMayNeedToUpdateYourself(msgComingFrom: AbstractDerivation<mixed>) {
    const updateNeededFrom =
      msgComingFrom === this._depDerivation
        ? UPDATE_NEEDED_FROM.dep
        : UPDATE_NEEDED_FROM.inner

    if (
      updateNeededFrom === UPDATE_NEEDED_FROM.inner &&
      msgComingFrom !== this._innerDerivation
    ) {
      throw Error(
        `got a _youMayNeedToUpdateYourself() from neither the dep nor the inner derivation`,
      )
    }

    if (this._updateNeededFrom === UPDATE_NEEDED_FROM.none) {
      this._updateNeededFrom = updateNeededFrom

      if (updateNeededFrom === UPDATE_NEEDED_FROM.dep) {
        this._removeInnerDerivation()
      }
    } else if (this._updateNeededFrom === UPDATE_NEEDED_FROM.dep) {
      // nothing
    } else {
      if (updateNeededFrom === UPDATE_NEEDED_FROM.dep) {
        this._updateNeededFrom = UPDATE_NEEDED_FROM.dep
        this._removeInnerDerivation()
      }
    }

    AbstractDerivation.prototype._youMayNeedToUpdateYourself.call(
      this,
      msgComingFrom,
    )
  }

  _removeInnerDerivation() {
    if (this._innerDerivation) {
      this._removeDependency(this._innerDerivation)
      this._innerDerivation = undefined
    }
  }

  _keepUptodate() {
    this._hot = true
    this._updateNeededFrom = UPDATE_NEEDED_FROM.dep
    this.getValue()
  }

  _stopKeepingUptodate() {
    this._hot = false
    this._updateNeededFrom = UPDATE_NEEDED_FROM.dep
    this._removeInnerDerivation()
  }
}

export default function flatMap<T, R extends AbstractDerivation<T>>(depDerivation: AbstractDerivation<T>, fn: (t: T) => R) {
  return new FlatMapDerivation(depDerivation, fn)
}