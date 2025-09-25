enum ReactiveFlags {
  IS_REF = '__v_isRef',
}

class RefImpl {
  _value;

  [ReactiveFlags.IS_REF] = true
  constructor(value) {
    this._value = value
  }
}

export function ref(value) {
  return new RefImpl(value)
}
