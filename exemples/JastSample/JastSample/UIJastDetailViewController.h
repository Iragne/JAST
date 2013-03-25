//
//  UIJastDetailViewController.h
//  JastSample
//
//  Created by adelskott on 24/03/13.
//  Copyright (c) 2013 adelskott. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface UIJastDetailViewController : UIViewController
@property (weak, nonatomic) IBOutlet UIWebView *w_web;
@property (strong, nonatomic) NSString *url;
@end
