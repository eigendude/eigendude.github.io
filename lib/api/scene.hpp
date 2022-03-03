/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#pragma once

#include <opencv2/gapi/gmat.hpp>
#include <opencv2/gapi/gkernel.hpp>
#include <opencv2/gapi/gopaque.hpp>
#include <utility> // std::tuple

namespace scene
{
  using TplDoubles = std::tuple<cv::GOpaque<double>, cv::GOpaque<double>>;
  using TplDoublesDesc = std::tuple<cv::GOpaqueDesc, cv::GOpaqueDesc>;

  G_TYPED_KERNEL(GCalcSceneScore, <TplDoubles(
      cv::GMat, cv::GMat, cv::GOpaque<double>, unsigned int, unsigned int)>,
      "com.trajectoryReconstruction.calcSceneScore")
  {
    static TplDoublesDesc outMeta(cv::GMatDesc,
                                  cv::GMatDesc,
                                  cv::GOpaqueDesc,
                                  unsigned int width,
                                  unsigned int height)
    {
      return std::make_tuple(cv::empty_gopaque_desc(), cv::empty_gopaque_desc());
    }
  };

  /*!
   * \brief Calculate a score indicating whether a scene change has taken place
   *
   * \param prevImg The previous frame
   * \param nextImg The following frame
   * \param prevMafd The previous mean absolute frame difference (MAFD)
   * \param width The width of a frame
   * \param height The height of a frame
   *
   * \return Two doubles - the MAFD of the following frame, and its scene score
   */
  TplDoubles CalcSceneScore(const cv::GMat& prevImg,
                            const cv::GMat& nextImg,
                            const cv::GOpaque<double>& prevMafd,
                            unsigned int width,
                            unsigned int height);
}
