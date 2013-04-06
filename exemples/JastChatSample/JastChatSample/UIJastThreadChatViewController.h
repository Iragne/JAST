//
//  UIJastThreadChatViewController.h
//  JastChatSample
//
//  Created by adelskott on 06/04/13.
//  Copyright (c) 2013 adelskott. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "UIBubbleTableViewDataSource.h"
#import "UIBubbleTableView.h"
#import "HPGrowingTextView.h"


@interface UIJastThreadChatViewController : UIViewController<UIBubbleTableViewDataSource,HPGrowingTextViewDelegate>{
    NSMutableArray *bubbleData;
    HPGrowingTextView *textView;
}
@property (nonatomic,strong) UIView *containerView;

@property (nonatomic,weak) IBOutlet UIBubbleTableView *bubbleTable;
@property (nonatomic,strong) NSString *me;
@property (nonatomic,strong) NSString *login;

@end
