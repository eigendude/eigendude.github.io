/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#pragma once

class MathUtils
{
public:
  /*!
   * \brief Calculate the geometric mean of two dimensions
   *
   * \param width An image width, in pixels
   * \param height An image height, in pixels
   *
   * \return The geometric mean, the square root of the product
   */
  static double GeometricMean(unsigned int width, unsigned int height);
};
