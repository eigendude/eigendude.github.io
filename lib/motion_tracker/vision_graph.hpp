/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#pragma once

#include <opencv2/core/mat.hpp>
#include <opencv2/gapi/gcompiled.hpp>
#include <stdint.h>
#include <vector>

class VisionGraph
{
public:
  VisionGraph() = default;
  ~VisionGraph();

  void Compile(unsigned int width,
               unsigned int height,
               const cv::Mat& currentFrame,
               const cv::Mat& currentGrayscale,
               const cv::Mat& previousGrayscale);

  void ApplyGrayscale(
      // Input
      const cv::Mat& currentFrame,
      // Output
      cv::Mat& currentGrayscale);

  void CalcSceneScore(
      // Input
      const cv::Mat& previousGrayscale,
      const cv::Mat& currentGrayscale,
      double previousMafd,
      // Output
      double& currentMafd,
      double& sceneScore);

  void CalcOpticalFlow(
      // Input
      const cv::Mat& previousGrayscale,
      const cv::Mat& currentGrayscale,
      const std::vector<cv::Point2f>& previousPoints,
      const std::vector<std::vector<cv::Point2f>>& pointHistory,
      // Output
      std::vector<cv::Point2f>& currentPoints,
      std::vector<uchar>& status,
      std::vector<float>& errors);

  void FindFeatures(
      // Input
      const cv::Mat& currentGrayscale,
      unsigned int maxFeatures,
      double minDistance,
      // Output
      std::vector<cv::Point2f>& currentPoints);

  void ReconstructTrajectory(
      // Input
      const std::vector<std::vector<cv::Point2f>>& pointHistory,
      const cv::Mat& previousCameraMatrix,
      // Output
      cv::Mat& projectionMatrix,
      cv::Mat& updatedCameraMatrix);

private:
  cv::GCompiled m_applyGrayscale;
  cv::GCompiled m_findFeatures;
  cv::GCompiled m_calcSceneScore;
  cv::GCompiled m_calcOpticalFlow;
  cv::GCompiled m_reconstructTrajectory;
};
