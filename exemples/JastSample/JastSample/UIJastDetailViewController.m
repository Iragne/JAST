//
//  UIJastDetailViewController.m
//  JastSample
//
//  Created by adelskott on 24/03/13.
//  Copyright (c) 2013 adelskott. All rights reserved.
//

#import "UIJastDetailViewController.h"

@interface UIJastDetailViewController ()

@end

@implementation UIJastDetailViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    if(_url)
        [_w_web loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:_url]]];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)dealloc
{
    
    [_w_web stopLoading];
}
@end
