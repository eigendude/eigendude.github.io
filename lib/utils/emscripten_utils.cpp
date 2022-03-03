/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#include "emscripten_utils.hpp"

unsigned int EmscriptenUtils::ArrayLength(const emscripten::val& array)
{
  return array["length"].as<unsigned int>();
}

void EmscriptenUtils::GetArrayData(const emscripten::val& array, uint8_t* dest, unsigned int destLength)
{
  emscripten::val memoryView{emscripten::typed_memory_view(destLength, dest)};
  memoryView.call<void>("set", array);
}
