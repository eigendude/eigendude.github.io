/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#include "math_utils.hpp"

#include <cmath>

double MathUtils::GeometricMean(unsigned int width, unsigned int height)
{
  double product = static_cast<double>(width) * static_cast<double>(height);

  return std::sqrt(product);
}
